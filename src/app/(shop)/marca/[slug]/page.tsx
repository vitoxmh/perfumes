import { notFound } from "next/navigation";
import { CatalogLayout } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { ProductGrid } from "@/components/product-grid";
import { allBrands, queryCatalog } from "@/lib/queries";

type RawParams = Promise<{ slug: string }>;
type RawSearch = Promise<Record<string, string | string[] | undefined>>;

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: RawParams;
  searchParams: RawSearch;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const brandsList = await allBrands();
  const brand = brandsList.find((b) => b.slug === slug);
  if (!brand) notFound();

  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const filters: Record<string, string | undefined> = {
    marca: slug,
    genero: Array.isArray(sp.genero) ? sp.genero[0] : sp.genero,
    tipo: Array.isArray(sp.tipo) ? sp.tipo[0] : sp.tipo,
    temporada: Array.isArray(sp.temporada) ? sp.temporada[0] : sp.temporada,
    precio: Array.isArray(sp.precio) ? sp.precio[0] : sp.precio,
    orderby: (Array.isArray(sp.orderby) ? sp.orderby[0] : sp.orderby) ?? "popularity",
  };

  const result = await queryCatalog({ ...filters, page });

  return (
    <CatalogLayout
      breadcrumb={brand.name}
      title={`Marca: ${brand.name}`}
      basePath={`/marca/${slug}`}
      params={filters}
      brands={brandsList}
      empty={result.items.length === 0}
      count={`Mostrando ${result.items.length} de ${result.total} productos`}
      pagination={
        <Pagination
          basePath={`/marca/${slug}`}
          params={filters}
          page={result.page}
          pages={result.pages}
        />
      }
    >
      <ProductGrid products={result.items} brands={brandsList} />
    </CatalogLayout>
  );
}
