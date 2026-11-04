"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, banners, orderItems, orders, products } from "@/db/schema";
import { requireAdminUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/validation";

const GENDERS = ["mujer", "hombre", "unisex", "set"];
const KINDS = ["perfume", "body-mist", "deodorant-corporal", "deodorant-ambiental"];
const TAGS = ["de-primavera-mujer", "de-primavera-hombre", "de-invierno"];
const ORDER_STATUSES = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "producto";
  for (let i = 0; ; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
  }
}

function intOrNull(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) && String(value ?? "").trim() !== "" ? Math.trunc(n) : null;
}

function checked(formData: FormData, name: string): boolean {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

function listField(formData: FormData, name: string, allowed: string[]): string[] {
  return formData.getAll(name).map(String).filter((v) => allowed.includes(v));
}

/** ---------------------------------------------------------------- Alta */
export async function createProduct(formData: FormData): Promise<void> {
  await requireAdminUser();

  const name = String(formData.get("name") ?? "").trim();
  const price = intOrNull(formData.get("price"));
  const brandId = intOrNull(formData.get("brandId"));
  const gender = String(formData.get("gender") ?? "unisex");

  if (!name) redirect("/admin/productos/nuevo?error=nombre");
  if (!brandId || !Number.isInteger(brandId)) redirect("/admin/productos/nuevo?error=marca");
  if (!price || price <= 0) redirect("/admin/productos/nuevo?error=precio");

  const slug = await uniqueSlug(slugify(name));
  const brandExists = await db.select({ id: brands.id }).from(brands).where(eq(brands.id, brandId!)).limit(1);
  if (brandExists.length === 0) redirect("/admin/productos/nuevo?error=marca");

  const notesRaw = String(formData.get("notes") ?? "");
  const notes = notesRaw
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 12);

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  await db.insert(products).values({
    slug,
    name,
    brandId: brandId!,
    gender: GENDERS.includes(gender) ? gender : "unisex",
    kind: KINDS.includes(String(formData.get("kind"))) ? String(formData.get("kind")) : "perfume",
    sizeMl: intOrNull(formData.get("sizeMl")),
    price: price!,
    compareAtPrice: intOrNull(formData.get("compareAtPrice")),
    description: String(formData.get("description") ?? "").trim() || null,
    notes: notes.length ? notes : null,
    tags: listField(formData, "tags", TAGS),
    imageUrl: imageUrl.startsWith("/") && imageUrl.length < 300 ? imageUrl : null,
    rating: null,
    ratingCount: 0,
    isNew: checked(formData, "isNew"),
    isWanted: checked(formData, "isWanted"),
    isPopular: checked(formData, "isPopular"),
    stock: Math.max(0, intOrNull(formData.get("stock")) ?? 20),
  });

  revalidatePath("/", "layout");
  redirect("/admin/productos");
}

/** ------------------------------------------------------------- Edición */
export async function updateProduct(formData: FormData): Promise<void> {
  await requireAdminUser();

  const id = intOrNull(formData.get("id"));
  if (!id) redirect("/admin/productos?error=producto");

  const name = String(formData.get("name") ?? "").trim();
  const price = intOrNull(formData.get("price"));
  const brandId = intOrNull(formData.get("brandId"));
  const gender = String(formData.get("gender") ?? "unisex");

  if (!name) redirect(`/admin/productos/${id}?error=nombre`);
  if (!brandId) redirect(`/admin/productos/${id}?error=marca`);
  if (!price || price <= 0) redirect(`/admin/productos/${id}?error=precio`);

  const notesRaw = String(formData.get("notes") ?? "");
  const notes = notesRaw
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 12);

  const slugInput = String(formData.get("slug") ?? "").trim();
  const currentSlug = String(formData.get("currentSlug") ?? "").trim();

  const slug =
    slugInput && slugInput !== currentSlug
      ? await uniqueSlug(slugify(slugInput))
      : currentSlug;

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  await db
    .update(products)
    .set({
      slug,
      name,
      brandId: brandId!,
      gender: GENDERS.includes(gender) ? gender : "unisex",
      kind: KINDS.includes(String(formData.get("kind"))) ? String(formData.get("kind")) : "perfume",
      sizeMl: intOrNull(formData.get("sizeMl")),
      price: price!,
      compareAtPrice: intOrNull(formData.get("compareAtPrice")),
      description: String(formData.get("description") ?? "").trim() || null,
      notes: notes.length ? notes : null,
      tags: listField(formData, "tags", TAGS),
      imageUrl: imageUrl.startsWith("/") && imageUrl.length < 300 ? imageUrl : null,
      isNew: checked(formData, "isNew"),
      isWanted: checked(formData, "isWanted"),
      isPopular: checked(formData, "isPopular"),
      stock: Math.max(0, intOrNull(formData.get("stock")) ?? 0),
    })
    .where(eq(products.id, id!));

  revalidatePath("/", "layout");
  redirect("/admin/productos");
}

/** ------------------------------------------------------------ Eliminar */
export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdminUser();

  const id = intOrNull(formData.get("id"));
  if (!id) redirect("/admin/productos?error=producto");

  try {
    await db.delete(products).where(eq(products.id, id!));
  } catch {
    // order_items tiene ON DELETE restrict: un producto vendido no se puede borrar.
    redirect("/admin/productos?error=vendido");
  }

  revalidatePath("/", "layout");
  redirect("/admin/productos");
}

/** --------------------------------------------------------------- Stock */
export async function setStock(formData: FormData): Promise<void> {
  await requireAdminUser();

  const id = intOrNull(formData.get("id"));
  const stock = intOrNull(formData.get("stock"));
  if (!id || stock === null || stock < 0) redirect("/admin/stock?error=stock");

  await db.update(products).set({ stock: stock! }).where(eq(products.id, id!));

  revalidatePath("/", "layout");
  redirect("/admin/stock?ok=1");
}

/** Stock de varios productos a la vez (una fila por producto en el formulario grande) */
export async function setStockMany(formData: FormData): Promise<void> {
  await requireAdminUser();

  const entries = Array.from(formData.entries()).filter(([key]) => key.startsWith("stock-"));
  await Promise.all(
    entries
      .map(([key, value]) => ({ id: Number(key.slice("stock-".length)), stock: Number(value) }))
      .filter(
        (e) => Number.isInteger(e.id) && e.id > 0 && Number.isFinite(e.stock) && e.stock >= 0
      )
      .map((e) =>
        db.update(products).set({ stock: Math.trunc(e.stock) }).where(eq(products.id, e.id))
      )
  );

  revalidatePath("/", "layout");
  redirect("/admin/stock?ok=1");
}

/** ------------------------------------------------------- Estado pedido */
export async function setOrderStatus(formData: FormData): Promise<void> {
  await requireAdminUser();

  const id = intOrNull(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!id || !ORDER_STATUSES.includes(status)) redirect("/admin/ordenes?error=estado");

  await db.update(orders).set({ status }).where(eq(orders.id, id!));

  revalidatePath("/", "layout");
  redirect("/admin/ordenes");
}

/** ------------------------------------------------------------- Banners */
function cleanImageUrl(formData: FormData): string | null {
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  return imageUrl.startsWith("/") && imageUrl.length < 300 ? imageUrl : null;
}

function safeHref(raw: string): string | null {
  // Solo rutas internas: el carrusel es público, sin links externos.
  const href = safeInternalPath(raw);
  return href || null;
}

export async function createBanner(formData: FormData): Promise<void> {
  await requireAdminUser();

  const title = String(formData.get("title") ?? "").trim();
  const href = safeHref(String(formData.get("href") ?? ""));
  if (!title) redirect("/admin/banners?error=titulo");
  if (!href) redirect("/admin/banners?error=link");

  const cta = String(formData.get("cta") ?? "").trim() || "Ver más";
  const sortOrder = intOrNull(formData.get("sortOrder")) ?? 0;

  await db.insert(banners).values({
    title: title.slice(0, 80),
    subtitle: String(formData.get("subtitle") ?? "").trim().slice(0, 120) || null,
    cta: cta.slice(0, 40),
    href,
    imageUrl: cleanImageUrl(formData),
    sortOrder,
    active: checked(formData, "active"),
  });

  revalidatePath("/", "layout");
  redirect("/admin/banners?ok=creado");
}

export async function updateBanner(formData: FormData): Promise<void> {
  await requireAdminUser();

  const id = intOrNull(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const href = safeHref(String(formData.get("href") ?? ""));

  if (!id) redirect("/admin/banners?error=banner");
  if (!title) redirect("/admin/banners?error=titulo");
  if (!href) redirect("/admin/banners?error=link");

  const cta = String(formData.get("cta") ?? "").trim() || "Ver más";
  const sortOrder = intOrNull(formData.get("sortOrder")) ?? 0;

  await db
    .update(banners)
    .set({
      title: title.slice(0, 80),
      subtitle: String(formData.get("subtitle") ?? "").trim().slice(0, 120) || null,
      cta: cta.slice(0, 40),
      href,
      imageUrl: cleanImageUrl(formData),
      sortOrder,
      active: checked(formData, "active"),
    })
    .where(eq(banners.id, id!));

  revalidatePath("/", "layout");
  redirect("/admin/banners?ok=guardado");
}

export async function deleteBanner(formData: FormData): Promise<void> {
  await requireAdminUser();

  const id = intOrNull(formData.get("id"));
  if (!id) redirect("/admin/banners?error=banner");

  await db.delete(banners).where(eq(banners.id, id!));

  revalidatePath("/", "layout");
  redirect("/admin/banners?ok=eliminado");
}
