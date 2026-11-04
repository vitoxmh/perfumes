import Link from "next/link";
import { adminStats, lowStockProducts } from "@/lib/admin-queries";
import { formatCLP } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default async function AdminDashboard() {
  const [stats, lowStock] = await Promise.all([adminStats(), lowStockProducts()]);

  const cards = [
    { label: "Productos", value: String(stats.totalProducts), href: "/admin/productos" },
    { label: "Sin stock", value: String(stats.outOfStock), href: "/admin/stock", warn: stats.outOfStock > 0 },
    { label: "Stock bajo (≤5)", value: String(stats.lowStock), href: "/admin/stock", warn: stats.lowStock > 0 },
    { label: "Pedidos pendientes", value: String(stats.pendingOrders), href: "/admin/ordenes", warn: stats.pendingOrders > 0 },
    { label: "Pedidos totales", value: String(stats.totalOrders), href: "/admin/ordenes" },
    {
      label: "Vendido (pagado+entregado)",
      value: formatCLP(stats.revenue),
      href: "/admin/ordenes",
    },
  ];

  return (
    <>
      <h1 className="admin__title">Resumen</h1>

      <div className="admin-cards">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`admin-cards__card ${c.warn ? "admin-cards__card--warn" : ""}`}
          >
            <span className="admin-cards__value">{c.value}</span>
            <span className="admin-cards__label">{c.label}</span>
          </Link>
        ))}
      </div>

      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Acciones rápidas</h2>
        </div>
        <div className="admin-card__body">
          <Link href="/admin/productos/nuevo" className="btn">
            + Subir un producto
          </Link>
          <Link href="/admin/ordenes" className="btn btn--outline">
            Ver órdenes
          </Link>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Stock bajo → reposición</h2>
          <Link href="/admin/stock" className="admin-card__link">
            Gestionar stock →
          </Link>
        </div>
        <div className="admin-card__body">
          {lowStock.length === 0 ? (
            <p className="admin-card__empty">Todo el stock está en niveles sanos. ✓</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-table__th">Producto</th>
                  <th className="admin-table__th">Marca</th>
                  <th className="admin-table__th admin-table__th--right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(({ product, brandName }) => (
                  <tr key={product.id}>
                    <td className="admin-table__td">
                      <Link href={`/admin/productos/${product.id}`} className="admin-table__link">
                        {product.name}
                      </Link>
                    </td>
                    <td className="admin-table__td admin-table__td--soft">{brandName}</td>
                    <td className="admin-table__td admin-table__td--right">
                      <span className="admin-pill admin-pill--warn">{product.stock}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
