# Perfumes.cl — Clon en Next.js + Neon DB

Tienda e-commerce de perfumería árabe inspirada en lattafaperfumes.cl, construida con Next.js (App Router) y PostgreSQL serverless en [Neon](https://neon.tech).

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Tailwind CSS v4**
- **Drizzle ORM** + **@neondatabase/serverless** (driver HTTP de Neon)
- Carrito en el cliente (localStorage), pedidos persistidos en Neon

## Funcionalidades

- Portada con carrusel hero y secciones "Lo más nuevo", "Lo más buscado", "Los más populares"
- Catálogo `/categoria/[slug]` con filtros (género, marca, tipo, temporada, precio, orden) y paginación
- Marcas `/marca/[slug]`
- Ficha de producto `/producto/[slug]` con selector de cantidad y productos relacionados
- Búsqueda `/buscar?q=`
- Carrito `/carrito` y checkout `/checkout` (despacho o retiro; envío gratis sobre $60.000)
- Página de pedido `/pedido/[code]` y seguimiento `/seguimiento`
- Páginas estáticas: tiendas y guía anti-falsificaciones

## Puesta en marcha

1. **Crea una base de datos en Neon**
   - Cuenta gratuita en https://neon.tech → crea un proyecto.
   - Copia la cadena de conexión (Connection string, opción *pooled*).

2. **Configura las variables de entorno**

   ```bash
   cp .env.example .env.local
   # edita .env.local y pega tu DATABASE_URL de Neon
   ```

   > En Windows PowerShell: `Copy-Item .env.example .env.local`, y edita el archivo.

3. **Crea las tablas y carga el catálogo de demostración**

   ```bash
   npm run db:push     # crea tablas con drizzle-kit
   npm run db:seed     # inserta 5 marcas y ~50 productos
   ```

4. **Desarrollo**

   ```bash
   npm run dev         # http://localhost:3000
   npm run build && npm start
   npm run db:studio   # explorar la base con Drizzle Studio
   ```

## Estructura

```
src/
  app/
    actions.ts              # Server Actions (checkout → crea pedido en Neon)
    page.tsx                # Portada
    categoria/[slug]/       # Catálogo por categoría con filtros
    marca/[slug]/           # Catálogo por marca
    producto/[slug]/        # Ficha de producto
    carrito/ checkout/      # Carrito y checkout
    pedido/[code]/          # Confirmación/detalle de pedido
    seguimiento/            # Seguimiento por código
    buscar/                 # Resultados de búsqueda
  components/               # Header, hero, tarjetas, filtros, checkout…
  db/
    schema.ts               # brands, products, orders, order_items
    seed.ts                 # Catálogo inicial
    index.ts                # Cliente Drizzle sobre neon-http
  lib/
    queries.ts              # Consultas de catálogo (filtros, paginación)
    cart-context.tsx        # Carrito (localStorage)
```

## Notas

- **Imágenes**: los productos se muestran con un placeholder SVG generado (design por slug con iniciales). Sube tus propias fotos y puebla `products.image_url` (acepta URLs remotas; `lattafaperfumes.cl` ya está permitido en `next.config.ts`).
- **Pagos**: el checkout es una demo; no integra una pasarela real. Puedes conectar Webpay/Transbank o Mercado Pago en el server action `placeOrderAndRedirect`.
- **Despliegue**: en Vercel agrega `DATABASE_URL` como variable de entorno (usa la conexión *pooled* de Neon).
