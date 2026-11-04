import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getSessionUser();

  return (
    <div className="page page--wide">
      <h1 className="page__title">Finalizar compra</h1>
      <CheckoutForm initialName={user?.name ?? ""} initialEmail={user?.email ?? ""} initialPhone={user?.phone ?? ""} />
    </div>
  );
}
