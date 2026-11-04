import Link from "next/link";
import { cx } from "@/lib/format";
import type { Brand } from "@/db/schema";

export type Params = {
  genero?: string;
  marca?: string;
  tipo?: string;
  temporada?: string;
  precio?: string;
  orderby?: string;
  q?: string;
};

const GENDERS = [
  { value: "mujer", label: "Mujer" },
  { value: "hombre", label: "Hombre" },
  { value: "unisex", label: "Unisex" },
  { value: "set", label: "Set" },
];

const KINDS = [
  { value: "perfume", label: "Perfumes EDP" },
  { value: "body-mist", label: "Body mist / Perfume mist" },
  { value: "deodorant-corporal", label: "Desodorante corporal" },
  { value: "deodorant-ambiental", label: "Desodorante ambiental" },
];

const TEMPORADAS = [
  { value: "de-primavera-mujer", label: "🌷 Primavera mujer" },
  { value: "de-primavera-hombre", label: "☀️ Primavera hombre" },
  { value: "de-invierno", label: "❄️ Invierno" },
];

const PRICES = [
  { value: "0-15000", label: "Menos de $15.000" },
  { value: "15000-20000", label: "$15.000 – $20.000" },
  { value: "20000-25000", label: "$20.000 – $25.000" },
  { value: "25000-30000", label: "$25.000 – $30.000" },
  { value: "30000", label: "Más de $30.000" },
];

const ORDERS = [
  { value: "date", label: "Más reciente" },
  { value: "popularity", label: "Más popular" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre A→Z" },
];

const SORTABLE_KEYS = [
  "genero",
  "marca",
  "tipo",
  "temporada",
  "precio",
  "orderby",
  "q",
] as const;

function buildHref(basePath: string, params: Params, changes: Params): string {
  const merged: Record<string, string | undefined> = { ...params, ...changes };
  const search = new URLSearchParams();
  for (const key of SORTABLE_KEYS) {
    const value = merged[key];
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function FilterGroup({
  title,
  options,
  activeValue,
  paramKey,
  params,
  basePath,
}: {
  title: string;
  options: { value: string; label: string }[];
  activeValue?: string;
  paramKey: keyof Params;
  params: Params;
  basePath: string;
}) {
  return (
    <div className="filters__group">
      <p className="filters__title">{title}</p>
      <ul className="filters__list">
        <li>
          <Link
            href={buildHref(basePath, params, { [paramKey]: undefined })}
            className={cx(
              "filters__option",
              activeValue === undefined || activeValue === "" ? "filters__option--active" : ""
            )}
          >
            Todos
          </Link>
        </li>
        {options.map((opt) => (
          <li key={opt.value}>
            <Link
              href={buildHref(basePath, params, { [paramKey]: opt.value })}
              className={cx(
                "filters__option",
                activeValue === opt.value ? "filters__option--active" : ""
              )}
            >
              {opt.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FiltersSidebar({
  basePath,
  params,
  brands,
}: {
  basePath: string;
  params: Params;
  brands: Brand[];
}) {
  const brandOptions = [
    { value: "lattafa", label: "Lattafa" },
    { value: "lattafa-pride", label: "Lattafa Pride" },
    { value: "lattafa-rave", label: "Lattafa Rave" },
    { value: "lattafa-asdaaf", label: "Lattafa Asdaaf" },
    { value: "niche-emarati", label: "Niche Emarati" },
    ...brands
      .map((b) => ({ value: b.slug, label: b.name }))
      .filter(
        (o) =>
          !["lattafa", "lattafa-pride", "lattafa-rave", "lattafa-asdaaf", "niche-emarati"].includes(
            o.value
          )
      ),
  ];

  return (
    <aside className="catalog__sidebar filters">
      <FilterGroup
        title="Ordenar por"
        options={ORDERS}
        activeValue={params.orderby}
        paramKey="orderby"
        params={params}
        basePath={basePath}
      />
      <FilterGroup
        title="Marca"
        options={brandOptions}
        activeValue={params.marca}
        paramKey="marca"
        params={params}
        basePath={basePath}
      />
      <FilterGroup
        title="Género"
        options={GENDERS}
        activeValue={params.genero}
        paramKey="genero"
        params={params}
        basePath={basePath}
      />
      <FilterGroup
        title="Tipo de producto"
        options={KINDS}
        activeValue={params.tipo}
        paramKey="tipo"
        params={params}
        basePath={basePath}
      />
      <FilterGroup
        title="Temporada"
        options={TEMPORADAS}
        activeValue={params.temporada}
        paramKey="temporada"
        params={params}
        basePath={basePath}
      />
      <FilterGroup
        title="Precio"
        options={PRICES}
        activeValue={params.precio}
        paramKey="precio"
        params={params}
        basePath={basePath}
      />
    </aside>
  );
}

export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav className="breadcrumb">
      <Link href="/" className="breadcrumb__link">
        Inicio
      </Link>
      <span className="breadcrumb__sep">/</span>
      <span className="breadcrumb__current">{current}</span>
    </nav>
  );
}

export function CatalogLayout({
  breadcrumb,
  title,
  basePath,
  params,
  brands,
  empty,
  count,
  children,
  pagination,
}: {
  breadcrumb: string;
  title: string;
  basePath: string;
  params: Params;
  brands: Brand[];
  empty: boolean;
  count: string;
  children: React.ReactNode;
  pagination?: React.ReactNode;
}) {
  return (
    <div className="page">
      <Breadcrumb current={breadcrumb} />
      <h1 className="page__title">{title}</h1>
      <div className="catalog">
        <FiltersSidebar basePath={basePath} params={params} brands={brands} />
        <div className="catalog__main">
          <p className="catalog__count">{count}</p>
          {empty ? (
            <div className="page-empty">
              <p className="page-empty__title">No encontramos productos con ese filtro.</p>
              <p>
                Prueba quitando filtros o{" "}
                <Link href="/categoria/perfumes-arabes" className="section__more">
                  explora el catálogo completo
                </Link>
                .
              </p>
            </div>
          ) : (
            children
          )}
          {pagination}
        </div>
      </div>
    </div>
  );
}
