import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogLayout } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { ProductGrid } from "@/components/product-grid";
import { allBrands, queryCatalog } from "@/lib/queries";

const CATEGORIES: Record<string, { title: string; params: Record<string, string> }> = {
  "mujer": { title: "Fragancias de mujer", params: { genero: "mujer" } },
  "hombre": { title: "Fragancias de hombre", params: { genero: "hombre" } },
  "unisex": { title: "Fragancias unisex", params: { genero: "unisex" } },
  "set": { title: "Sets y cofres", params: { genero: "set" } },
  "de-primavera-mujer": { title: "🌷 De primavera mujer", params: { temporada: "de-primavera-mujer" } },
  "de-primavera-hombre": { title: "☀️ De primavera hombre", params: { temporada: "de-primavera-hombre" } },
  "de-invierno": { title: "❄️ De invierno", params: { temporada: "de-invierno" } },
  "desodorante-corporal": { title: "Desodorantes corporales", params: { tipo: "deodorant-corporal" } },
  "desodorant-ambiental": { title: "Desodorantes ambientales", params: { tipo: "deodorant-ambiental" } },
  "perfumes-arabes": { title: "Todas las fragancias", params: {} },
};

type RawParams = Promise<{ slug: string }>;
type RawSearch = Promise<Record<string, string | string[] | undefined>>;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: RawParams;
  searchParams: RawSearch;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = CATEGORIES[slug];
  if (!category) notFound();

  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const filters: Record<string, string | undefined> = {
    ...category.params,
    genero: (Array.isArray(sp.genero) ? sp.genero[0] : sp.genero) ?? category.params.genero,
    marca: (Array.isArray(sp.marca) ? sp.marca[0] : sp.marca) ?? category.params.marca,
    tipo: (Array.isArray(sp.tipo) ? sp.tipo[0] : sp.tipo) ?? category.params.tipo,
    temporada: (Array.isArray(sp.temporada) ? sp.temporada[0] : sp.temporada) ?? category.params.temporada,
    precio: (Array.isArray(sp.precio) ? sp.precio[0] : sp.precio) ?? category.params.precio,
    orderby: (Array.isArray(sp.orderby) ? sp.orderby[0] : sp.orderby) ?? "date",
  };

  const [result, brands] = await Promise.all([queryCatalog({ ...filters, page }), allBrands()]);

  return (
    <CatalogLayout
      breadcrumb={category.title}
      title={category.title}
      basePath={`/categoria/${slug}`}
      params={filters}
      brands={brands}
      empty={result.items.length === 0}
      count={`Mostrando ${result.items.length} de ${result.total} productos`}
      pagination={
        <Pagination
          basePath={`/categoria/${slug}`}
          params={filters}
          page={result.page}
          pages={result.pages}
        />
      }
    >
      <ProductGrid products={result.items} brands={brands} />
    </CatalogLayout>
  );
}
