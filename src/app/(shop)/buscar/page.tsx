import { CatalogLayout } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { ProductGrid } from "@/components/product-grid";
import { allBrands, queryCatalog } from "@/lib/queries";

type RawSearch = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: RawSearch }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const filters: Record<string, string | undefined> = {
    genero: Array.isArray(sp.genero) ? sp.genero[0] : sp.genero,
    marca: Array.isArray(sp.marca) ? sp.marca[0] : sp.marca,
    tipo: Array.isArray(sp.tipo) ? sp.tipo[0] : sp.tipo,
    precio: Array.isArray(sp.precio) ? sp.precio[0] : sp.precio,
    orderby: (Array.isArray(sp.orderby) ? sp.orderby[0] : sp.orderby) ?? "date",
  };

  const [result, brands] = await Promise.all([
    queryCatalog({ ...filters, q, page }),
    allBrands(),
  ]);

  return (
    <CatalogLayout
      breadcrumb={`Búsqueda: ${q}`}
      title={q ? `Resultados de “${q}”` : "Búsqueda"}
      basePath="/buscar"
      params={{ ...filters, q }}
      brands={brands}
      empty={result.items.length === 0}
      count={`Mostrando ${result.items.length} de ${result.total} productos`}
      pagination={
        <Pagination
          basePath="/buscar"
          params={{ ...filters, q }}
          page={result.page}
          pages={result.pages}
        />
      }
    >
      {!q ? (
        <div className="page-empty">
          <p className="page-empty__title">Escribe algo en el buscador para empezar.</p>
        </div>
      ) : (
        <ProductGrid products={result.items} brands={brands} />
      )}
    </CatalogLayout>
  );
}
