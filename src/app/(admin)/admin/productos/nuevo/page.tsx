import Link from "next/link";
import type { Metadata } from "next";
import { allBrands } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const brands = await allBrands();

  return (
    <>
      <div className="admin__row">
        <h1 className="admin__title">Nuevo producto</h1>
        <Link href="/admin/productos" className="btn btn--outline">
          ← Volver al listado
        </Link>
      </div>
      <ProductForm brands={brands} />
    </>
  );
}
