import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatCLP } from "@/lib/format";
import { ORDER_CODE_RE, clientIpKey, rateLimit } from "@/lib/validation";

type RawSearch = Promise<Record<string, string | string[] | undefined>>;

async function searchOrder(formData: FormData) {
  "use server";
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  redirect(code ? `/seguimiento?code=${encodeURIComponent(code)}` : "/seguimiento");
}

export default async function TrackingPage({ searchParams }: { searchParams: RawSearch }) {
  const sp = await searchParams;
  const raw = (Array.isArray(sp.code) ? sp.code[0] : sp.code)?.toUpperCase().trim() ?? "";

  // Búsquedas públicas de códigos: máx. 40 por IP cada 10 min (frena enumeración).
  const limited = !rateLimit(await clientIpKey("seguimiento"), 40, 10 * 60 * 1000);

  const order =
    !limited && ORDER_CODE_RE.test(raw)
      ? (await db.select().from(orders).where(and(eq(orders.code, raw))).limit(1))[0]
      : undefined;

  return (
    <div className="page page--narrow tracking">
      <h1 className="page__title">Seguimiento de pedido</h1>
      <p className="page__lead">
        Ingresa el código que te enviamos al realizar tu compra (por ejemplo LP-XXXXXX).
      </p>

      <form action={searchOrder} className="tracking__form">
        <input
          name="code"
          placeholder="LP-A1B2C3"
          defaultValue={raw}
          className="tracking__input"
        />
        <button type="submit" className="btn">
          Buscar
        </button>
      </form>

      {limited ? (
        <p className="tracking__error">
          Demasiadas búsquedas seguidas. Espera unos minutos e intenta de nuevo.
        </p>
      ) : null}

      {raw && !ORDER_CODE_RE.test(raw) ? (
        <p className="tracking__error">El código no tiene el formato esperado (ej.: LP-A1B2C3).</p>
      ) : null}

      {!limited && ORDER_CODE_RE.test(raw) && !order ? (
        <p className="tracking__error">
          No encontramos ningún pedido con el código &ldquo;{raw}&rdquo;.
        </p>
      ) : null}

      {order ? (
        <div className="tracking__card">
          <div className="tracking__head">
            <p className="tracking__code">{order.code}</p>
            <span className="order-card__status">{order.status}</span>
          </div>
          <p className="tracking__meta">
            Pedido el {order.createdAt.toLocaleDateString("es-CL")} ·{" "}
            {order.deliveryMethod === "retiro" ? "Retiro en tienda" : "Despacho a domicilio"}
          </p>
          <ol className="tracking__steps">
            <li className={order.status !== "pendiente" ? "tracking__step--done" : ""}>
              1. Pedido confirmado ✓
            </li>
            <li>2. Pago verificado</li>
            <li>3. En camino</li>
            <li>4. Entregado</li>
          </ol>
          <a href={`/pedido/${order.code}`} className="tracking__detail-link">
            Ver detalle completo ({formatCLP(order.total)}) →
          </a>
        </div>
      ) : null}
    </div>
  );
}
