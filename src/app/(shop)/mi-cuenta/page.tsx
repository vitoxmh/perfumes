import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { userOrders, type AccountOrder } from "@/lib/account-queries";
import { formatCLP } from "@/lib/format";
import { ORDER_CODE_RE } from "@/lib/validation";

export const metadata = { title: "Mi cuenta — Perfumes.cl" };

const DELIVERY_LABELS: Record<string, string> = {
  despacho: "Despacho a domicilio",
  retiro: "Retiro en tienda",
};

function OrderRow({ entry }: { entry: AccountOrder }) {
  const { order, items } = entry;
  return (
    <tr className="order-table__row">
      <td className="order-table__name">
        <Link href={`/pedido/${order.code}`} className="order-help__link">
          {order.code}
        </Link>
      </td>
      <td className="order-table__qty">
        {order.createdAt.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })}
      </td>
      <td className="order-table__qty">{items.length > 0 ? `${items.reduce((n, i) => n + i.quantity, 0)} art.` : "—"}</td>
      <td className="order-table__amount">{formatCLP(order.total)}</td>
      <td className="order-table__qty">
        <span className="order-card__status">{order.status}</span>
      </td>
      <td className="order-table__name">
        <Link href={`/pedido/${order.code}`} className="order-help__link">
          Ver detalle →
        </Link>
      </td>
    </tr>
  );
}

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/ingresar?next=%2Fmi-cuenta");

  const history = await userOrders(user.email);
  const safeLast = history[0];
  const last = safeLast && ORDER_CODE_RE.test(safeLast.order.code) ? safeLast : undefined;
  const rest = last ? history.slice(1) : history;

  return (
    <div className="page page--order">
      <h1 className="page__title">Mi cuenta</h1>
      <p className="page__lead">
        Hola {user.name.split(" ")[0]}, aquí están tus pedidos registrados con {user.email}.
      </p>

      {last ? (
        <div className="order-card">
          <div className="order-card__header">
            <div>
              <p className="order-card__label">Último pedido</p>
              <p className="order-card__code">
                <Link href={`/pedido/${last.order.code}`} className="order-help__link">
                  {last.order.code}
                </Link>
              </p>
            </div>
            <span className="order-card__status">{last.order.status}</span>
          </div>

          <table className="order-table">
            <thead>
              <tr>
                <th className="order-table__th">Producto</th>
                <th className="order-table__th order-table__th--center">Cant.</th>
                <th className="order-table__th order-table__th--right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {last.items.map((item) => (
                <tr key={item.id} className="order-table__row">
                  <td className="order-table__name">{item.name}</td>
                  <td className="order-table__qty">{item.quantity}</td>
                  <td className="order-table__amount">{formatCLP(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="order-table__foot-label">Despacho</td>
                <td className="order-table__foot-amount">
                  {last.order.shippingCost === 0 ? "Gratis" : formatCLP(last.order.shippingCost)}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="order-table__foot-total-label">Total</td>
                <td className="order-table__foot-total">{formatCLP(last.order.total)}</td>
              </tr>
            </tfoot>
          </table>

          <p className="order-help">
            Pedido el {last.order.createdAt.toLocaleDateString("es-CL")} ·{" "}
            {DELIVERY_LABELS[last.order.deliveryMethod] ?? last.order.deliveryMethod} ·{" "}
            <Link href={`/pedido/${last.order.code}`} className="order-help__link">
              Ver detalle completo →
            </Link>
          </p>
        </div>
      ) : (
        <div className="page-empty">
          <p className="page-empty__title">Todavía no tienes pedidos.</p>
          <p>
            <Link href="/categoria/perfumes-arabes" className="section__more">
              Explora el catálogo
            </Link>{" "}
            y hace tu primera compra.
          </p>
        </div>
      )}

      {rest.length > 0 ? (
        <>
          <h2 className="page__title page__title--small">Historial de pedidos</h2>
          <div className="order-card">
            <table className="order-table">
              <thead>
                <tr>
                  <th className="order-table__th">Pedido</th>
                  <th className="order-table__th order-table__th--center">Fecha</th>
                  <th className="order-table__th order-table__th--center">Artículos</th>
                  <th className="order-table__th order-table__th--right">Total</th>
                  <th className="order-table__th order-table__th--center">Estado</th>
                  <th className="order-table__th" />
                </tr>
              </thead>
              <tbody>
                {rest.map((entry) => (
                  <OrderRow key={entry.order.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
