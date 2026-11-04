import Link from "next/link";
import type { Metadata } from "next";
import { adminProducts } from "@/lib/admin-queries";
import { setStockMany } from "@/lib/admin-actions";

export const metadata: Metadata = { title: "Stock" };

type RawSearch = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminStockPage({ searchParams }: { searchParams: RawSearch }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const saved = (Array.isArray(sp.ok) ? sp.ok[0] : sp.ok) === "1";

  const items = await adminProducts(q);
  const sinStock = items.filter((i) => i.product.stock === 0).length;

  return (
    <>
      <div className="admin__row">
        <h1 className="admin__title">Stock ({items.length} productos)</h1>
        <Link href="/admin/productos" className="btn btn--outline btn--compact">
          ← Productos
        </Link>
      </div>

      {saved ? <p className="admin-alert admin-alert--ok">✓ Stock actualizado.</p> : null}
      {sinStock > 0 ? (
        <p className="admin-alert admin-alert--warn">
          ⚠ {sinStock} producto{sinStock === 1 ? "" : "s"} sin stock: aparecen como “Vendido” en la
          tienda.
        </p>
      ) : null}

      <form className="admin-search" action="/admin/stock">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o marca…"
          className="admin-search__input"
        />
        <button type="submit" className="btn btn--compact">
          Buscar
        </button>
      </form>

      {/* Una sola acción guarda todas las filas a la vez */}
      <form action={setStockMany}>
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table__th">Producto</th>
                <th className="admin-table__th">Marca</th>
                <th className="admin-table__th admin-table__th--center">Stock actual</th>
                <th className="admin-table__th admin-table__th--center">Nuevo stock</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ product, brandName }) => (
                <tr key={product.id}>
                  <td className="admin-table__td">
                    <Link href={`/admin/productos/${product.id}`} className="admin-table__link">
                      {product.name}
                    </Link>
                  </td>
                  <td className="admin-table__td admin-table__td--soft">{brandName}</td>
                  <td
                    className="admin-table__td admin-table__td--center"
                  >
                    <span
                      className={`admin-pill ${
                        product.stock === 0
                          ? "admin-pill--danger"
                          : product.stock <= 5
                            ? "admin-pill--warn"
                            : "admin-pill--ok"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="admin-table__td admin-table__td--center">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      name={`stock-${product.id}`}
                      defaultValue={product.stock}
                      className="admin-table__stock-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="stocksave">
          <button type="submit" className="btn">
            Guardar todos los cambios
          </button>
        </div>
      </form>
    </>
  );
}
