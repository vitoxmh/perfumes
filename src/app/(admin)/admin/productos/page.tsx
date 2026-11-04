import Link from "next/link";
import { adminProducts } from "@/lib/admin-queries";
import { deleteProduct } from "@/lib/admin-actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatCLP } from "@/lib/format";

export const metadata = { title: "Productos" };

type RawSearch = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminProductsPage({ searchParams }: { searchParams: RawSearch }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const deletedSold = (Array.isArray(sp.error) ? sp.error[0] : sp.error) === "vendido";

  const items = await adminProducts(q);

  return (
    <>
      <div className="admin__row">
        <h1 className="admin__title">Productos ({items.length})</h1>
        <Link href="/admin/productos/nuevo" className="btn">
          + Nuevo producto
        </Link>
      </div>

      {deletedSold ? (
        <p className="admin-alert admin-alert--warn">
          No se pudo eliminar: el producto tiene órdenes asociadas. Cambia su stock a 0 en lugar de borrarlo.
        </p>
      ) : null}

      <form className="admin-search" action="/admin/productos">
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

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table__th">Producto</th>
              <th className="admin-table__th">Marca</th>
              <th className="admin-table__th admin-table__th--right">Precio</th>
              <th className="admin-table__th admin-table__th--center">Stock</th>
              <th className="admin-table__th admin-table__th--center">Destacados</th>
              <th className="admin-table__th admin-table__th--right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ product, brandName }) => (
              <tr key={product.id}>
                <td className="admin-table__td">
                  <div className="admin-table__prod">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="admin-table__thumb" />
                    ) : (
                      <span className="admin-table__thumb admin-table__thumb--empty" />
                    )}
                    <div className="admin-table__prod-info">
                      <Link href={`/admin/productos/${product.id}`} className="admin-table__link">
                        {product.name}
                      </Link>
                      <span className="admin-table__mono">/{product.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="admin-table__td admin-table__td--soft">{brandName}</td>
                <td className="admin-table__td admin-table__td--right">{formatCLP(product.price)}</td>
                <td className="admin-table__td admin-table__td--center">
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
                  {[
                    product.isNew && "N",
                    product.isPopular && "P",
                    product.isWanted && "W",
                  ]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </td>
                <td className="admin-table__td admin-table__td--right">
                  <div className="admin-table__actions">
                    <Link href={`/admin/productos/${product.id}`} className="btn btn--compact btn--outline">
                      Editar
                    </Link>
                    <form>
                      <DeleteButton action={deleteProduct} id={product.id} name={product.name} />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table__td admin-table__td--center admin-table__td--soft">
                  Sin resultados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
