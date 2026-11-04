"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { inArray } from "drizzle-orm";

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

  if (payload.deliveryMethod === "despacho") {
    if (!payload.address?.trim() || !payload.city?.trim() || !payload.region?.trim())
      return { ok: false, error: "Completa la dirección de despacho." };
    if (
      payload.address.trim().length > 200 ||
      payload.city.trim().length > 80 ||
      payload.region.trim().length > 80
    )
      return { ok: false, error: "Dirección demasiado larga." };
  }

  const ids = cleanItems.map((i) => i.id);
  const dbProducts = await db.select().from(products).where(inArray(products.id, ids));
  const byId = new Map(dbProducts.map((p) => [p.id, p]));

  const lines = cleanItems.map((i) => {
    const p = byId.get(i.id);
    if (!p) throw new Error("Producto no encontrado");
    return { product: p, quantity: i.quantity };
  });

  const subtotal = lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0);
  const shippingCost = payload.deliveryMethod === "retiro" ? 0 : subtotal >= 60000 ? 0 : 4990;
  const total = subtotal + shippingCost;

  const code = `LP-${randomBytes(3).toString("hex").toUpperCase()}`;

  const [order] = await db
    .insert(orders)
    .values({
      code,
      customerName: payload.customerName.trim(),
      customerEmail: payload.customerEmail.trim().toLowerCase(),
      customerPhone: payload.customerPhone.trim(),
      deliveryMethod: payload.deliveryMethod,
      address: payload.deliveryMethod === "despacho" ? payload.address!.trim() : null,
      region: payload.deliveryMethod === "despacho" ? payload.region!.trim() : null,
      city: payload.deliveryMethod === "despacho" ? payload.city!.trim() : null,
      notes: payload.notes?.trim().slice(0, 500) || null,
      paymentMethod: payload.paymentMethod === "credito" ? "credito" : "transferencia",
      subtotal,
      shippingCost,
      total,
      status: "pendiente",
    })
    .returning();

  await db.insert(orderItems).values(
    lines.map((l) => ({
      orderId: order.id,
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
