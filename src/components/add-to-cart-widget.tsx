"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, type CartProduct } from "@/lib/cart-context";

export function AddToCartWidget({
  product,
  stock,
}: {
  product: CartProduct;
  stock: number;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    add(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (added) {
    return (
      <div className="addtocart">
        <div className="addtocart__success">✓ Añadido al carrito</div>
        <div className="addtocart__links">
          <Link href="/carrito" className="btn">
            Ver carrito
          </Link>
          <button onClick={() => setAdded(false)} className="btn btn--outline">
            Seguir comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="addtocart">
      <div className="addtocart__purchase">
        <div className="qty">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Disminuir cantidad"
            className="qty__control"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.min(stock, Math.max(1, Number(e.target.value) || 1)))
            }
            className="qty__input"
            min={1}
            max={stock}
            aria-label="Cantidad"
          />
          <button
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            aria-label="Aumentar cantidad"
            className="qty__control"
          >
            +
          </button>
        </div>
        <button onClick={addToCart} className="btn addtocart__submit">
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
