"use client";

import { useCart } from "@/lib/cart-context";
import { formatCLP } from "@/lib/format";
import { ProductPlaceholder } from "./product-placeholder";

export function CartView() {
  const { lines, count, subtotal, setQuantity, remove, hydrated, clear } = useCart();

  if (!hydrated) {
    return <p className="cart-loading">Cargando carrito…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="cart-empty">
        <p className="cart-empty__icon">🛍️</p>
        <p className="cart-empty__message">Tu carrito está vacío</p>
        <a href="/categoria/perfumes-arabes" className="btn">
          Ver catálogo
        </a>
      </div>
    );
  }

  const shipping = subtotal >= 60000 ? 0 : 4990;

  return (
    <div className="cart__layout">
      <div>
        <ul className="cart-list">
          {lines.map((line) => (
            <li key={line.id} className="cart-list__line">
              <div className="cart-line__image">
                {line.imageUrl ? (
                  <img src={line.imageUrl} alt={line.name} />
                ) : (
                  <ProductPlaceholder slug={line.slug} name={line.name} />
                )}
              </div>
              <div className="cart-line__info">
                <p className="cart-line__brand">{line.brand}</p>
                <a href={`/producto/${line.slug}`} className="cart-line__name">
                  {line.name}
                </a>
                <p className="cart-line__price">{formatCLP(line.price)}</p>
              </div>
              <div className="cart-line__aside">
                <button
                  onClick={() => remove(line.id)}
                  aria-label={`Quitar ${line.name}`}
                  className="cart-line__remove"
                >
                  Quitar
                </button>
                <div className="qty">
                  <button
                    onClick={() => setQuantity(line.id, line.quantity - 1)}
                    className="qty__control"
                    aria-label="Disminuir"
                  >
                    −
                  </button>
                  <span className="cart-line__quantity">{line.quantity}</span>
                  <button
                    onClick={() => setQuantity(line.id, line.quantity + 1)}
                    className="qty__control"
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button onClick={clear} className="cart-list__clear">
          Vaciar carrito
        </button>
      </div>

      <aside className="cart-side">
        <h3 className="cart-side__title">Resumen</h3>
        <dl className="cart-side__totals">
          <div className="cart-side__row">
            <dt className="cart-side__label">Productos ({count})</dt>
            <dd>{formatCLP(subtotal)}</dd>
          </div>
          <div className="cart-side__row">
            <dt className="cart-side__label">Despacho</dt>
            <dd>{shipping === 0 ? "Gratis" : formatCLP(shipping)}</dd>
          </div>
          <div className="cart-side__total-row">
            <dt>Total</dt>
            <dd>{formatCLP(subtotal + shipping)}</dd>
          </div>
        </dl>
        <p className="cart-side__installments">
          3 cuotas sin interés de {formatCLP(Math.round((subtotal + shipping) / 3))} con tarjeta.
        </p>
        <a href="/checkout" className="btn btn--block cart-side__cta">
          Finalizar compra
        </a>
        <p className="cart-side__shipping-note">Envío GRATIS en compras sobre $60.000</p>
      </aside>
    </div>
  );
}
