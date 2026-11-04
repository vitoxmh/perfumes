import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCart } from "@/components/checkout-form";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { formatCLP } from "@/lib/format";

type Params = Promise<{ code: string }>;
type RawSearch = Promise<Record<string, string | string[] | undefined>>;

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: RawSearch;
}) {
  const { code } = await params;
  const sp = await searchParams;
  const isNew = (Array.isArray(sp.nuevo) ? sp.nuevo[0] : sp.nuevo) === "1";

  const [order] = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!order) notFound();
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.id));

  return (
    <div className="page page--order">
      {isNew ? <ClearCart /> : null}
      {isNew ? (
        <div className="order-success">
          <p className="order-success__icon">🎉</p>
          <h1 className="order-success__title">¡Pedido recibido!</h1>
          <p className="order-success__message">
            Te contactaremos con los datos de pago y el estado de tu pedido.
          </p>
        </div>
      ) : null}

      <div className="order-card">
        <div className="order-card__header">
          <div>
            <p className="order-card__label">Pedido</p>
            <p className="order-card__code">{order.code}</p>
          </div>
          <span className="order-card__status">{order.status}</span>
        </div>

        <dl className="order-card__customer-grid">
          <div>
            <dt className="order-card__dt">Cliente</dt>
            <dd className="order-card__dd-strong">{order.customerName}</dd>
            <dd className="order-card__dd-soft">{order.customerEmail}</dd>
            <dd className="order-card__dd-soft">{order.customerPhone}</dd>
          </div>
          <div>
            <dt className="order-card__dt">Entrega</dt>
            <dd className="order-card__dd-strong order-card__dd-strong--capitalize">
              {order.deliveryMethod === "retiro" ? "Retiro en tienda" : "Despacho a domicilio"}
            </dd>
            {order.address ? (
              <dd className="order-card__dd-soft">
                {order.address}, {order.city}, {order.region}
              </dd>
            ) : null}
          </div>
        </dl>

        <table className="order-table">
          <thead>
            <tr>
              <th className="order-table__th">Producto</th>
              <th className="order-table__th order-table__th--center">Cant.</th>
              <th className="order-table__th order-table__th--right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="order-table__row">
                <td className="order-table__name">{item.name}</td>
                <td className="order-table__qty">{item.quantity}</td>
                <td className="order-table__amount">
                  {formatCLP(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="order-table__foot-label">Subtotal</td>
              <td className="order-table__foot-amount">{formatCLP(order.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="order-table__foot-label">Despacho</td>
              <td className="order-table__foot-amount">
                {order.shippingCost === 0 ? "Gratis" : formatCLP(order.shippingCost)}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="order-table__foot-total-label">Total</td>
              <td className="order-table__foot-total">{formatCLP(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="order-help">
        ¿Necesitas ayuda?{" "}
        <Link href="/seguimiento" className="order-help__link">
          Consulta el estado de tu pedido aquí
        </Link>
      </p>
    </div>
  );
}
