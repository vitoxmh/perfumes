import type { Metadata } from "next";
import { adminOrders } from "@/lib/admin-queries";
import { setOrderStatus } from "@/lib/admin-actions";
import { formatCLP } from "@/lib/format";

export const metadata: Metadata = { title: "Órdenes" };

const STATUSES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

export default async function AdminOrdersPage() {
  const ordersList = await adminOrders();

  return (
    <>
      <h1 className="admin__title">Órdenes ({ordersList.length})</h1>

      {ordersList.length === 0 ? (
        <div className="admin-card">
          <p className="admin-card__empty">Todavía no hay pedidos.</p>
        </div>
      ) : (
        ordersList.map(({ order, items }) => (
          <section key={order.id} className="admin-card">
            <div className="admin-card__head">
              <div>
                <p className="admin-card__code">{order.code}</p>
                <p className="admin-card__meta">
                  {order.createdAt.toLocaleDateString("es-CL")} ·{" "}
                  {order.deliveryMethod === "retiro" ? "Retiro en tienda" : "Despacho"} ·{" "}
                  {order.paymentMethod}
                </p>
              </div>
              <p className="admin-card__total">{formatCLP(order.total)}</p>
            </div>

            <div className="admin-card__body">
              <dl className="admin-note">
                <div>
                  <dt className="admin-note__dt">Cliente</dt>
                  <dd className="admin-note__dd">
                    {order.customerName} · {order.customerEmail} · {order.customerPhone}
                  </dd>
                </div>
                {order.address ? (
                  <div>
                    <dt className="admin-note__dt">Dirección</dt>
                    <dd className="admin-note__dd">
                      {order.address}, {order.city}, {order.region}
                    </dd>
                  </div>
                ) : null}
                {order.notes ? (
                  <div>
                    <dt className="admin-note__dt">Comentarios</dt>
                    <dd className="admin-note__dd">{order.notes}</dd>
                  </div>
                ) : null}
              </dl>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-table__th">Producto</th>
                    <th className="admin-table__th admin-table__th--center">Cant.</th>
                    <th className="admin-table__th admin-table__th--right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="admin-table__td">{item.name}</td>
                      <td className="admin-table__td admin-table__td--center">{item.quantity}</td>
                      <td className="admin-table__td admin-table__td--right">
                        {formatCLP(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} className="admin-table__td admin-table__td--right admin-table__td--soft">
                      Despacho: {order.shippingCost === 0 ? "Gratis" : formatCLP(order.shippingCost)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>

              <form action={setOrderStatus} className="admin-status">
                <label className="admin-form-label" htmlFor={`status-${order.id}`}>
                  Estado
                </label>
                <select
                  id={`status-${order.id}`}
                  name="status"
                  defaultValue={order.status}
                  className="adminform__select admin-status__select"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="id" value={order.id} />
                <button type="submit" className="btn btn--compact">
                  Actualizar estado
                </button>
                <span
                  className={`admin-pill admin-status__badge admin-pill--${order.status === "cancelado" ? "danger" : order.status === "pendiente" ? "warn" : "ok"}`}
                >
                  {order.status}
                </span>
              </form>
            </div>
          </section>
        ))
      )}
    </>
  );
}
