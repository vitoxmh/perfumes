CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"delivery_method" text DEFAULT 'despacho' NOT NULL,
	"address" text,
	"region" text,
	"city" text,
	"notes" text,
	"payment_method" text DEFAULT 'transferencia' NOT NULL,
	"subtotal" integer NOT NULL,
	"shipping_cost" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"brand_id" integer NOT NULL,
	"gender" text NOT NULL,
	"kind" text DEFAULT 'perfume' NOT NULL,
	"size_ml" integer,
	"price" integer NOT NULL,
	"compare_at_price" integer,
	"description" text,
	"notes" jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"image_url" text,
	"rating" numeric(3, 2),
	"rating_count" integer DEFAULT 0,
	"is_new" boolean DEFAULT false,
	"is_wanted" boolean DEFAULT false,
	"is_popular" boolean DEFAULT false,
	"stock" integer DEFAULT 20 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;