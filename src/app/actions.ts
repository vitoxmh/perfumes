"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { isUniqueViolation } from "@/lib/validation";

export type CheckoutPayload = {
  items: { id: number; quantity: number }[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: "despacho" | "retiro";
  address?: string;
  region?: string;
  city?: string;
  notes?: string;
  paymentMethod: string;
};

export async function createOrder(payload: CheckoutPayload): Promise<{
  ok: boolean;
  error?: string;
  code?: string;
}> {
  const cleanItems = payload.items
    .filter((i) => Number.isInteger(i.id) && i.id > 0 && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 20)
    .slice(0, 40);

  if (!cleanItems.length) return { ok: false, error: "El carrito está vacío." };
  if (!payload.customerName?.trim() || payload.customerName.trim().length > 80)
    return { ok: false, error: "Ingresa tu nombre." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.customerEmail ?? ""))
    return { ok: false, error: "Ingresa un correo válido." };
  if (!/^[+0-9\s()-]{8,20}$/.test(payload.customerPhone ?? ""))
    return { ok: false, error: "Ingresa un teléfono válido." };
  if (payload.paymentMethod !== "credito" && payload.paymentMethod !== "transferencia")
    return { ok: false, error: "Método de pago inválido." };

  // Whitelist del método de entrega: cualquier otro valor se rechaza.
  const delivery =
    payload.deliveryMethod === "despacho" || payload.deliveryMethod === "retiro"
      ? payload.deliveryMethod
      : null;
  if (!delivery) return { ok: false, error: "Método de entrega inválido." };

  if (delivery === "despacho") {
    if (!payload.address?.trim() || !payload.city?.trim() || !payload.region?.trim())
      return { ok: false, error: "Completa la dirección de despacho." };
    if (
      payload.address.trim().length > 200 ||
      payload.city.trim().length > 80 ||
      payload.region.trim().length > 80
    )
      return { ok: false, error: "Dirección demasiado larga." };
  }

  // Agregar cantidades por producto (el carrito puede repetir un id) y limitar.
  const quantities = new Map<number, number>();
  for (const item of cleanItems) {
    quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);
  }
  for (const qty of quantities.values()) {
    if (qty > 40) return { ok: false, error: "Demasiada cantidad de un mismo producto." };
  }

  const entries = [...quantities.entries()];
  const dbProducts = await db.select().from(products).where(inArray(products.id, entries.map(([id]) => id)));
  const byId = new Map(dbProducts.map((p) => [p.id, p]));

  if (byId.size !== entries.length) {
    return { ok: false, error: "Hay productos que ya no están disponibles." };
  }

  // Descontar stock de forma atómica: cada UPDATE solo aplica si hay stock
  // suficiente (neon-http no soporta transacciones interactivas). Si alguno
  // falla, se restauran los descontados y se avisa al cliente.
  const decremented = await Promise.all(
    entries.map(([id, qty]) =>
      db
        .update(products)
        .set({ stock: sql`${products.stock} - ${qty}` })
        .where(and(eq(products.id, id), gte(products.stock, qty)))
        .returning({ id: products.id })
    )
  );

  const failed = entries.filter((_, i) => decremented[i].length === 0);
  if (failed.length > 0) {
    const rollback = entries.filter((_, i) => decremented[i].length > 0);
    if (rollback.length > 0) {
      await Promise.all(
        rollback.map(([id, qty]) =>
          db
            .update(products)
            .set({ stock: sql`${products.stock} + ${qty}` })
            .where(eq(products.id, id))
        )
      );
    }
    const names = failed.map(([id]) => byId.get(id)?.name ?? `#${id}`);
    return { ok: false, error: `Stock insuficiente de: ${names.join(", ")}.` };
  }

  // El total SIEMPRE se calcula desde la BD, nunca desde el carrito del cliente.
  const lines = entries.map(([id, qty]) => ({ product: byId.get(id)!, quantity: qty }));
  const subtotal = lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0);
  const shippingCost = delivery === "retiro" ? 0 : subtotal >= 60000 ? 0 : 4990;
  const total = subtotal + shippingCost;

  const customerValues = {
    customerName: payload.customerName.trim(),
    customerEmail: payload.customerEmail.trim().toLowerCase(),
    customerPhone: payload.customerPhone.trim(),
    deliveryMethod: delivery,
    address: delivery === "despacho" ? payload.address!.trim() : null,
    region: delivery === "despacho" ? payload.region!.trim() : null,
    city: delivery === "despacho" ? payload.city!.trim() : null,
    notes: payload.notes?.trim().slice(0, 500) || null,
    paymentMethod: payload.paymentMethod,
    subtotal,
    shippingCost,
    total,
    status: "pendiente" as const,
  };

  // Código con 64 bits de aleatoriedad (antes: 24 bits, enumerable) y reintentos
  // ante colisión (improbable, pero la columna code es UNIQUE).
  let order: typeof orders.$inferSelect | undefined;
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    const code = `LP-${randomBytes(8).toString("hex").toUpperCase()}`;
    try {
      [order] = await db
        .insert(orders)
        .values({ ...customerValues, code })
        .returning();
    } catch (error) {
      if (!isUniqueViolation(error)) {
        // La orden no se registró: devolver el stock descontado.
        await Promise.all(
          entries.map(([id, qty]) =>
            db
              .update(products)
              .set({ stock: sql`${products.stock} + ${qty}` })
              .where(eq(products.id, id))
          )
        );
        throw error;
      }
    }
  }

  if (!order) {
    await Promise.all(
      entries.map(([id, qty]) =>
        db
          .update(products)
          .set({ stock: sql`${products.stock} + ${qty}` })
          .where(eq(products.id, id))
      )
    );
    return { ok: false, error: "No se pudo generar el código del pedido. Intenta de nuevo." };
  }

  await db.insert(orderItems).values(
    lines.map((l) => ({
      orderId: order!.id,
      productId: l.product.id,
      name: l.product.name,
      price: l.product.price,
      quantity: l.quantity,
    }))
  );

  revalidatePath("/pedido");
  return { ok: true, code: order.code };
}

export async function placeOrderAndRedirect(payload: CheckoutPayload): Promise<void> {
  const result = await createOrder(payload);
  if (!result.ok || !result.code) {
    throw new Error(result.error ?? "No se pudo crear el pedido");
  }
  redirect(`/pedido/${result.code}?nuevo=1`);
}
