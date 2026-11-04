import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  brandId: integer("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  /** mujer | hombre | unisex | set */
  gender: text("gender").notNull(),
  /** perfume | body-mist | deodorant-corporal | deodorant-ambiental */
  kind: text("kind").notNull().default("perfume"),
  sizeMl: integer("size_ml"),
  /** Precio en CLP */
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  description: text("description"),
  notes: jsonb("notes").$type<string[]>(),
  /** de-primavera-mujer | de-primavera-hombre | de-invierno */
  tags: jsonb("tags").$type<string[]>().default([]),
  imageUrl: text("image_url"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  ratingCount: integer("rating_count").default(0),
  isNew: boolean("is_new").default(false),
  isWanted: boolean("is_wanted").default(false),
  isPopular: boolean("is_popular").default(false),
  stock: integer("stock").notNull().default(20),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryMethod: text("delivery_method").notNull().default("despacho"),
  address: text("address"),
  region: text("region"),
  city: text("city"),
  notes: text("notes"),
  paymentMethod: text("payment_method").notNull().default("transferencia"),
  subtotal: integer("subtotal").notNull(),
  shippingCost: integer("shipping_cost").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pendiente"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

/** Imágenes subidas desde el panel admin (base64 en la BD: portable entre hosts). */
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  /** Contenido base64 del archivo */
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductImage = typeof images.$inferSelect;

/** Cuentas de usuario: clientes y administradores (role = admin | cliente). */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  /** "-//admin?" no: formato "s1$sal$hash" (scrypt), ver src/lib/auth.ts */
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("cliente"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

/**
 * Sesiones activas del lado servidor (revocables).
 * El id es el HMAC(AUTH_SECRET, token) de la cookie: un dump de la BD no basta
 * para reconstruir tokens, y revocar una fila invalida la sesión al instante.
 */
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;

/** Banners del carrusel principal (hero) de la home. */
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  /** Texto del botón, por defecto "Ver más" */
  cta: text("cta").notNull().default("Ver más"),
  /** Ruta interna a la que lleva el botón */
  href: text("href").notNull(),
  /** Imagen de fondo (normalmente /api/imagen/N) */
  imageUrl: text("image_url"),
  /** Orden de aparición (menor primero) */
  sortOrder: integer("sort_order").notNull().default(0),
  /** Los inactivos no se muestran en la tienda */
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Banner = typeof banners.$inferSelect;
