import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <div className="page page--narrow">
      <h1 className="page__title">Carrito</h1>
      <CartView />
    </div>
  );
}
