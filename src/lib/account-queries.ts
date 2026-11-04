import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, type Order, type OrderItem } from "@/db/schema";

export type AccountOrder = { order: Order; items: OrderItem[] };

/**
 * Historial de pedidos del usuario autenticado. La ownership se resuelve por
 * email: solo pedidos registrados con el email de la sesión (los pedidos
 * hechos como invitado con el mismo correo también aparecen).
 */
export async function userOrders(email: string, limit = 50): Promise<AccountOrder[]> {
  try {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, email.trim().toLowerCase()))
      .orderBy(desc(orders.id))
      .limit(limit);
    if (rows.length === 0) return [];

    const items = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, rows.map((o) => o.id)))
      .orderBy(asc(orderItems.id));

    const byOrder = new Map<number, OrderItem[]>();
    for (const item of items) {
      const list = byOrder.get(item.orderId) ?? [];
      list.push(item);
      byOrder.set(item.orderId, list);
    }

    return rows.map((order) => ({ order, items: byOrder.get(order.id) ?? [] }));
  } catch (error) {
    console.error("[account] historial no disponible:", error);
    return [];
  }
}
