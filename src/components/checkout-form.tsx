"use client";

import { useCart } from "@/lib/cart-context";
import { placeOrderAndRedirect } from "@/app/actions";
import { formatCLP } from "@/lib/format";
import { useEffect, useState, useTransition } from "react";

export function CheckoutForm({
  initialName = "",
  initialEmail = "",
  initialPhone = "",
}: {
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
}) {
  const { lines, subtotal, hydrated } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<"despacho" | "retiro">("despacho");

  const shipping = delivery === "retiro" || subtotal >= 60000 ? 0 : 4990;
  const total = subtotal + shipping;

  async function onSubmit(formData: FormData) {
    setError(null);
    const payload = {
      items: lines.map((l) => ({ id: l.id, quantity: l.quantity })),
      customerName: String(formData.get("customerName") ?? ""),
      customerEmail: String(formData.get("customerEmail") ?? ""),
      customerPhone: String(formData.get("customerPhone") ?? ""),
      deliveryMethod: delivery,
      address: String(formData.get("address") ?? ""),
      region: String(formData.get("region") ?? ""),
      city: String(formData.get("city") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      paymentMethod: String(formData.get("paymentMethod") ?? "transferencia"),
    } as const;

    startTransition(async () => {
      try {
        await placeOrderAndRedirect({ ...payload });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error inesperado");
      }
    });
  }

  if (!hydrated) {
    return <p className="cart-loading">Cargando…</p>;
  }

  if (lines.length === 0) {
    return (
      <p className="cart-empty__message">
        Tu carrito está vacío.{" "}
        <a href="/categoria/perfumes-arabes" className="section__more">
          Volver al catálogo
        </a>
      </p>
    );
  }

  return (
    <form action={onSubmit} className="checkout" aria-busy={pending}>
      <div className="checkout__body">
        <fieldset className="checkout__fieldset">
          <legend className="checkout__legend">1. Tus datos</legend>
          <div className="checkout__grid">
            <input name="customerName" required placeholder="Nombre completo" defaultValue={initialName} className="checkout__field" />
            <input name="customerEmail" type="email" required placeholder="Email" defaultValue={initialEmail} className="checkout__field" />
            <input name="customerPhone" required placeholder="Teléfono (WhatsApp)" defaultValue={initialPhone} className="checkout__field" />
          </div>
        </fieldset>

        <fieldset className="checkout__fieldset">
          <legend className="checkout__legend">2. Entrega</legend>
          <div className="checkout__options">
            <label className="checkout__option">
              <input
                type="radio"
                name="delivery"
                value="despacho"
                checked={delivery === "despacho"}
                onChange={() => setDelivery("despacho")}
              />
              Despacho a domicilio
            </label>
            <label className="checkout__option">
              <input
                type="radio"
                name="delivery"
                value="retiro"
                checked={delivery === "retiro"}
                onChange={() => setDelivery("retiro")}
              />
              Retiro en tienda (Santiago)
            </label>
          </div>
          {delivery === "despacho" ? (
            <div className="checkout__grid checkout__grid--address">
              <input name="address" required placeholder="Dirección" className="checkout__field checkout__field--full" />
              <input name="region" required placeholder="Región" className="checkout__field" />
              <input name="city" required placeholder="Comuna / Ciudad" className="checkout__field" />
            </div>
          ) : null}
          <textarea
            name="notes"
            placeholder="Comentarios sobre tu pedido (opcional)"
            rows={2}
            className="checkout__textarea"
          />
        </fieldset>

        <fieldset className="checkout__fieldset">
          <legend className="checkout__legend">3. Pago</legend>
          <div className="checkout__options">
            <label className="checkout__option">
              <input type="radio" name="paymentMethod" value="transferencia" defaultChecked />
              Transferencia bancaria
            </label>
            <label className="checkout__option">
              <input type="radio" name="paymentMethod" value="credito" />
              Crédito hasta 3 cuotas
            </label>
          </div>
          <p className="checkout__payment-note">
            Una vez creado el pedido te contactaremos con los datos de pago (demo; sin
            pasarela real integrada).
          </p>
        </fieldset>
      </div>

      <aside className="checkout__side">
        <h3 className="checkout__side-title">Tu pedido</h3>
        <ul>
          {lines.map((l) => (
            <li key={l.id} className="checkout__line">
              <span className="checkout__line-name">
                {l.quantity}× {l.name}
              </span>
              <span className="checkout__line-amount">
                {formatCLP(l.price * l.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="checkout__totals">
          <div className="checkout__line">
            <span className="cart-side__label">Subtotal</span>
            <span>{formatCLP(subtotal)}</span>
          </div>
          <div className="checkout__line">
            <span className="cart-side__label">Despacho</span>
            <span>{shipping === 0 ? "Gratis" : formatCLP(shipping)}</span>
          </div>
          <div className="checkout__total">
            <span>Total</span>
            <span>{formatCLP(total)}</span>
          </div>
        </div>
        {error ? <p className="checkout__error">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="btn btn--block checkout__submit"
        >
          {pending ? "Procesando…" : "Confirmar pedido"}
        </button>
      </aside>
    </form>
  );
}

export function ClearCart() {
  const { clear, hydrated } = useCart();
  useEffect(() => {
    if (hydrated) clear();
  }, [clear, hydrated]);
  return null;
}
