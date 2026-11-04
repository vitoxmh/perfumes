import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AddToCartWidget } from "@/components/add-to-cart-widget";
import { ProductsSection } from "@/components/product-grid";
import { ProductPlaceholder } from "@/components/product-placeholder";
import { Breadcrumb } from "@/components/filters";
import { allBrands, productBySlug, relatedProducts } from "@/lib/queries";
import { formatCLP, installment } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await productBySlug(slug);
  if (!data) return { title: "Producto no encontrado" };
  return {
    title: data.product.name,
    description: data.product.description ?? data.product.name,
  };
}

const GENDER_LABELS: Record<string, string> = {
  mujer: "Mujer",
  hombre: "Hombre",
  unisex: "Unisex",
  set: "Set",
};

const KIND_LABELS: Record<string, string> = {
  perfume: "Eau de Parfum",
  "body-mist": "Perfume Mist",
  "deodorant-corporal": "Desodorante corporal",
  "deodorant-ambiental": "Desodorante ambiental",
};

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await productBySlug(slug);
  if (!data) notFound();

  const { product, brand } = data;
  const [brands, related] = await Promise.all([allBrands(), relatedProducts(product)]);

  return (
    <div className="product">
      <Breadcrumb current={product.name} />
      {/* encabezado de migas con enlace a la marca */}
      <div className="breadcrumb breadcrumb--brand">
        <Link href={`/marca/${brand.slug}`} className="breadcrumb__link">
          {brand.name}
        </Link>
      </div>

      <div className="product__panel">
        <div className="product__gallery">
          <div className="product__main-image">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <ProductPlaceholder slug={product.slug} name={product.name} />
            )}
          </div>
          <div className="product__thumbs">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="product__thumb">
                <ProductPlaceholder slug={`${product.slug}-${i}`} name={product.name} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="product__brand">{brand.name}</p>
          <h1 className="product__title">{product.name}</h1>

          {product.rating ? (
            <p className="product__rating">
              {"★".repeat(Math.round(Number(product.rating)))}
              <span className="product__rating-score">
                {product.rating} / 5 [{product.ratingCount} evaluaciones]
              </span>
            </p>
          ) : null}

          <div className="product__pricing">
            <p className="product__price">{formatCLP(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="product__price-old">
                Precio normal {formatCLP(product.compareAtPrice)}
              </p>
            ) : null}
            <p className="product__installments">
              3 cuotas sin interés de {formatCLP(installment(product.price))}
            </p>
          </div>

          <dl className="product__meta">
            <div className="product__meta-item">
              <dt className="product__meta-label">Género</dt>
              <dd className="product__meta-value">
                {GENDER_LABELS[product.gender] ?? product.gender}
              </dd>
            </div>
            <div className="product__meta-item">
              <dt className="product__meta-label">Formato</dt>
              <dd className="product__meta-value">{KIND_LABELS[product.kind] ?? product.kind}</dd>
            </div>
            <div className="product__meta-item">
              <dt className="product__meta-label">Contenido</dt>
              <dd className="product__meta-value">
                {product.sizeMl ? `${product.sizeMl} ml` : "—"}
              </dd>
            </div>
            <div className="product__meta-item">
              <dt className="product__meta-label">Disponibilidad</dt>
              <dd className="product__meta-value product__meta-value--stock">
                {product.stock > 0 ? "En stock" : "Vendido"}
              </dd>
            </div>
          </dl>

          <AddToCartWidget
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              brand: brand.name,
              price: product.price,
              imageUrl: product.imageUrl,
            }}
            stock={product.stock}
          />

          <div className="product__description">
            <p>{product.description}</p>
            {product.notes?.length ? (
              <>
                <p className="product__notes-title">Notas principales</p>
                <p>{product.notes.join(" + ")}</p>
              </>
            ) : null}
            <ul className="product__guarantees">
              <li>✓ Producto original, importado oficialmente.</li>
              <li>✓ Envío GRATIS sobre $60.000 · Pagas con débito o crédito.</li>
              <li>✓ Despachos a todo Chile en 2 a 7 días hábiles.</li>
            </ul>
          </div>
        </div>
      </div>

      <ProductsSection
        title="También te puede gustar"
        subtitle="Fragancias afines con las que suelen combinarse."
        products={related}
        brands={brands}
      />
    </div>
  );
}
