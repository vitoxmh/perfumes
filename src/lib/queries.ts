import { and, asc, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { banners, brands, products, type Product } from "@/db/schema";

/** Recorre toda la cadena de causas de un error y devuelve su texto completo. */
function errorChainMessage(error: unknown, depth = 0): string {
  if (depth > 4) return "";
  if (typeof error !== "object" || error === null) {
    return typeof error === "string" ? error : String(error ?? "");
  }
  const record = error as { message?: unknown; cause?: unknown; sourceError?: unknown };
  const own =
    error instanceof Error
      ? `${error.message} ${error.stack ?? ""}`
      : String(record.message ?? "");
  const nested = "sourceError" in record ? record.sourceError : "cause" in record ? record.cause : null;
  const causeText = nested ? " " + errorChainMessage(nested, depth + 1) : "";
  return own + causeText;
}

/** Devuelve el fallback si la base de datos no está configurada o no responde. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = errorChainMessage(error);
    const connectionIssues = [
      "DATABASE_URL",
      "ENOTFOUND",
      "ECONNREFUSED",
      "AUTHENTICATION",
      "Identity/connection",
      "Too many connections",
      "fetch failed",
      "password authentication",
    ];

    if (connectionIssues.some((issue) => message.includes(issue))) {
      console.error("[db] no disponible:", message.slice(0, 300));
      return fallback;
    }
    throw error;
  }
}
export type CatalogFilters = {
  genero?: string;
  marca?: string;
  tipo?: string;
  temporada?: string;
  precio?: string;
  q?: string;
  orderby?: string;
  page?: number;
};

export const PAGE_SIZE = 12;

const PRICE_RANGES: Record<string, { min?: number; max?: number }> = {
  "0-15000": { max: 15000 },
  "15000-20000": { min: 15000, max: 20000 },
  "20000-25000": { min: 20000, max: 25000 },
  "25000-30000": { min: 25000, max: 30000 },
  "30000": { min: 30000 },
};

function buildWhere(f: CatalogFilters): SQL | undefined {
  const conds: (SQL | undefined)[] = [];

  if (f.genero) conds.push(eq(products.gender, f.genero));
  if (f.marca) conds.push(eq(brands.slug, f.marca));
  if (f.tipo) conds.push(eq(products.kind, f.tipo));
  if (f.temporada) conds.push(sql`${products.tags} @> ${JSON.stringify([f.temporada])}::jsonb`);
  if (f.precio && PRICE_RANGES[f.precio]) {
    const r = PRICE_RANGES[f.precio];
    if (r.min !== undefined) conds.push(gte(products.price, r.min));
    if (r.max !== undefined) conds.push(lte(products.price, r.max));
  }
  if (f.q) {
    const term = `%${f.q}%`;
    conds.push(or(ilike(products.name, term), ilike(brands.name, term)));
  }

  return conds.length ? and(...conds) : undefined;
}

function orderBy(f: CatalogFilters) {
  switch (f.orderby) {
    case "price":
    case "price-asc":
      return [asc(products.price)];
    case "price-desc":
      return [desc(products.price)];
    case "popularity":
      return [desc(products.isPopular), asc(products.price)];
    case "name":
      return [asc(products.name)];
    case "date":
    default:
      return [desc(products.createdAt), desc(products.id)];
  }
}

export type CatalogResult = { items: Product[]; total: number; page: number; pages: number };

export async function queryCatalog(f: CatalogFilters): Promise<CatalogResult> {
  return safe(async () => {
    const where = buildWhere(f);
    const page = Math.max(1, f.page ?? 1);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(where);

    const items = await db
      .select({ p: products })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(where)
      .orderBy(...orderBy(f))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE);

    return {
      items: items.map((r) => r.p),
      total: count,
      page,
      pages: Math.max(1, Math.ceil(count / PAGE_SIZE)),
    };
  }, { items: [], total: 0, page: 1, pages: 1 });
}

export function newProducts(limit = 12) {
  return safe(async () => {
    const rows = await db
      .select({ p: products })
      .from(products)
      .where(eq(products.isNew, true))
      .orderBy(desc(products.id))
      .limit(limit);
    return rows.map((r) => r.p);
  }, []);
}

export function wantedProducts(limit = 10) {
  return safe(async () => {
    const rows = await db
      .select({ p: products })
      .from(products)
      .where(eq(products.isWanted, true))
      .orderBy(desc(products.isPopular), asc(products.price))
      .limit(limit);
    return rows.map((r) => r.p);
  }, []);
}

export function popularProducts(limit = 12) {
  return safe(async () => {
    const rows = await db
      .select({ p: products })
      .from(products)
      .where(eq(products.isPopular, true))
      .orderBy(asc(products.id))
      .limit(limit);
    return rows.map((r) => r.p);
  }, []);
}

export async function productBySlug(
  slug: string
): Promise<{ product: Product; brand: { slug: string; name: string } } | null> {
  return safe(async () => {
    const [row] = await db
      .select({ p: products, brandSlug: brands.slug, brandName: brands.name })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.slug, slug))
      .limit(1);
    if (!row) return null;
    return { product: row.p, brand: { slug: row.brandSlug ?? "", name: row.brandName ?? "" } };
  }, null);
}

export function relatedProducts(product: Product, limit = 8) {
  return safe(async () => {
    const rows = await db
      .select({ p: products })
      .from(products)
      .where(and(eq(products.gender, product.gender), sql`${products.id} <> ${product.id}`))
      .orderBy(desc(products.isPopular))
      .limit(limit);
    return rows.map((r) => r.p);
  }, []);
}

export function allBrands() {
  return safe(() => db.select().from(brands).orderBy(asc(brands.id)), []);
}

export type HeroBanner = {
  title: string;
  subtitle: string | null;
  cta: string;
  href: string;
  imageUrl: string | null;
};

/** Banners visibles del carrusel de la home; [] si no hay o la DB no responde. */
export function activeBanners(): Promise<HeroBanner[]> {
  return safe(
    () =>
      db
        .select({
          title: banners.title,
          subtitle: banners.subtitle,
          cta: banners.cta,
          href: banners.href,
          imageUrl: banners.imageUrl,
        })
        .from(banners)
        .where(eq(banners.active, true))
        .orderBy(asc(banners.sortOrder), desc(banners.id))
        .limit(8),
    []
  );
}
