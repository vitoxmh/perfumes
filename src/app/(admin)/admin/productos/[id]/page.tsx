import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allBrands } from "@/lib/queries";
import { productForEdit } from "@/lib/admin-queries";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Editar producto" };

type RouteParams = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: RouteParams }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const [data, brands] = await Promise.all([productForEdit(productId), allBrands()]);
  if (!data) notFound();

  return (
    <>
      <div className="admin__row">
        <h1 className="admin__title">Editar: {data.product.name}</h1>
        <div className="admin__row-actions">
          <Link href={`/producto/${data.product.slug}`} className="btn btn--outline btn--compact">
            Ver en la tienda ↗
          </Link>
          <Link href="/admin/productos" className="btn btn--outline btn--compact">
            ← Listado
          </Link>
        </div>
      </div>
      <ProductForm brands={brands} product={data.product} />
    </>
  );
}
