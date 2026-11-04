import { and, asc, desc, eq, ilike, lte, or, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { escapeLike } from "@/lib/validation";
import { banners, brands, orderItems, orders, products, type Banner, type Order, type OrderItem, type Product } from "@/db/schema";

export type AdminStats = {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  pendingOrders: number;
  totalOrders: number;
  revenue: number;
};

export async function adminStats(): Promise<AdminStats> {
  try {
  const ops = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(products),
    db.select({ n: sql<number>`count(*)::int` }).from(products).where(eq(products.stock, 0)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(products)
      .where(and(sql`${products.stock} > 0`, lte(products.stock, 5))),
    db.select({ n: sql<number>`count(*)::int` }).from(orders).where(eq(orders.status, "pendiente")),
    db.select({ n: sql<number>`count(*)::int` }).from(orders),
    db
      .select({ sum: sql<number>`coalesce(sum(${orders.total}), 0)::int` })
      .from(orders)
      .where(or(eq(orders.status, "pagado"), eq(orders.status, "entregado"))),
  ]);

  return {
    totalProducts: ops[0][0].n,
    outOfStock: ops[1][0].n,
    lowStock: ops[2][0].n,
    pendingOrders: ops[3][0].n,
    totalOrders: ops[4][0].n,
    revenue: ops[5][0].sum,
  };
  } catch (error) {
    // Si la DB no responde, el panel sigue cargando con las tarjetas en cero.
    console.error("[admin] stats no disponibles:", error);
    return { totalProducts: 0, outOfStock: 0, lowStock: 0, pendingOrders: 0, totalOrders: 0, revenue: 0 };
  }
}

export type AdminProduct = { product: Product; brandName: string };

export async function adminProducts(q?: string): Promise<AdminProduct[]> {
  const term = q?.trim();
  const likeTerm = term ? `%${escapeLike(term)}%` : undefined;
  const rows = await db
    .select({ p: products, brandName: brands.name })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(likeTerm ? or(ilike(products.name, likeTerm), ilike(brands.name, likeTerm)) : undefined)
    .orderBy(desc(products.id));
  return rows.map((r) => ({ product: r.p, brandName: r.brandName ?? "" }));
}

export async function lowStockProducts(limit = 8): Promise<AdminProduct[]> {
  const rows = await db
    .select({ p: products, brandName: brands.name })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(sql`${products.stock} > 0`, lte(products.stock, 5)))
    .orderBy(asc(products.stock))
    .limit(limit);
  return rows.map((r) => ({ product: r.p, brandName: r.brandName ?? "" }));
}

export type AdminOrder = {
  order: Order;
  items: OrderItem[];
};

export async function adminOrders(limit = 60): Promise<AdminOrder[]> {
  const rows = await db.select().from(orders).orderBy(desc(orders.id)).limit(limit);
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
}

export async function productForEdit(id: number): Promise<AdminProduct | null> {
  const [row] = await db
    .select({ p: products, brandName: brands.name })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(eq(products.id, id))
    .limit(1);
  if (!row) return null;
  return { product: row.p, brandName: row.brandName ?? "" };
}

/** Todos los banners, ordenados por sort_order (activos primero). */
export async function adminBanners(): Promise<Banner[]> {
  return db.select().from(banners).orderBy(desc(banners.active), asc(banners.sortOrder), desc(banners.id));
}
