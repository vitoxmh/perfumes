import Link from "next/link";
import type { Params } from "./filters";

export function Pagination({
  basePath,
  params,
  page,
  pages,
}: {
  basePath: string;
  params: Params;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;

  function pageHref(p: number): string {
    const merged = { ...params, page: String(p) };
    const search = new URLSearchParams();
    for (const key of [
      "genero",
      "marca",
      "tipo",
      "temporada",
      "precio",
      "orderby",
      "q",
    ] as const) {
      const value = (merged as Record<string, string | undefined>)[key];
      if (value) search.set(key, value);
    }
    if (p > 1) search.set("page", String(p));
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav className="pagination">
      {page > 1 ? (
        <Link href={pageHref(page - 1)} className="pagination__page">
          ‹ Anterior
        </Link>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={pageHref(p)}
          className={`pagination__page ${p === page ? "pagination__page--current" : ""}`}
        >
          {p}
        </Link>
      ))}
      {page < pages ? (
        <Link href={pageHref(page + 1)} className="pagination__page">
          Siguiente ›
        </Link>
      ) : null}
    </nav>
  );
}
