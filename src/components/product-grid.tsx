import Link from "next/link";
import type { Product, Brand } from "@/db/schema";
import { ProductCard, type ProductView } from "./product-card";

export function ProductGrid({
  products,
  brands,
}: {
  products: Product[];
  brands: Brand[];
}) {
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const items: ProductView[] = products.map((p) => ({
    product: p,
    brand: brandById.get(p.brandId) ?? { id: p.brandId, slug: "", name: "" },
  }));

  return (
    <div className="product-grid">
      {items.map((item) => (
        <ProductCard key={item.product.id} item={item} />
      ))}
    </div>
  );
}

export function ProductsSection({
  title,
  subtitle,
  moreHref,
  products,
  brands,
}: {
  title: string;
  subtitle?: string;
  moreHref?: string;
  products: Product[];
  brands: Brand[];
}) {
  return (
    <section className="section">
      <div className="section__inner">
        <div className="section__header">
          <div>
            <h2 className="section__title">{title}</h2>
            {subtitle ? <p className="section__subtitle">{subtitle}</p> : null}
          </div>
          {moreHref ? (
            <Link href={moreHref} className="section__more">
              Ver más productos →
            </Link>
          ) : null}
        </div>
        <ProductGrid products={products} brands={brands} />
      </div>
    </section>
  );
}

export function WantedStrip({
  wanted,
}: {
  wanted: Pick<Product, "id" | "name" | "slug">[];
}) {
  return (
    <section className="section">
      <div className="wanted">
        <h2 className="wanted__title">Lo más buscado</h2>
        <p className="wanted__subtitle">Tendencias y fragancias virales del momento.</p>
        <ul className="wanted__list">
          {wanted.map((p) => (
            <li key={p.id}>
              <a href={`/producto/${p.slug}`} className="wanted__card">
                {p.name.replace(/^(Lattafa|Niche Emarati)\s+(Pride\s+|Rave\s+|Asdaaf\s+)?/i, "")}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
