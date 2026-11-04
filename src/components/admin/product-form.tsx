import Link from "next/link";
import type { Brand, Product } from "@/db/schema";
import { createProduct, updateProduct, deleteProduct } from "@/lib/admin-actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { DeleteButton } from "@/components/admin/delete-button";

const GENDER_OPTIONS = [
  { value: "mujer", label: "Mujer" },
  { value: "hombre", label: "Hombre" },
  { value: "unisex", label: "Unisex" },
  { value: "set", label: "Set" },
];

const KIND_OPTIONS = [
  { value: "perfume", label: "Perfume EDP" },
  { value: "body-mist", label: "Body mist" },
  { value: "deodorant-corporal", label: "Desodorante corporal" },
  { value: "deodorant-ambiental", label: "Desodorante ambiental" },
];

const TAG_OPTIONS = [
  { value: "de-primavera-mujer", label: "🌷 Primavera mujer" },
  { value: "de-primavera-hombre", label: "☀️ Primavera hombre" },
  { value: "de-invierno", label: "❄️ Invierno" },
];

export function ProductForm({ brands, product }: { brands: Brand[]; product?: Product }) {
  const editing = Boolean(product);
  const flags = product?.tags ?? [];

  return (
    <form
      action={editing ? updateProduct : createProduct}
      className="adminform"
    >
      {editing ? (
        <>
          <input type="hidden" name="id" value={product!.id} />
          <input type="hidden" name="currentSlug" value={product!.slug} />
        </>
      ) : null}

      <div className="adminform__main">
        <div className="adminform__group">
          <label className="adminform__label" htmlFor="pf-name">
            Nombre del producto *
          </label>
          <input
            id="pf-name"
            name="name"
            required
            maxLength={120}
            defaultValue={product?.name ?? ""}
            className="adminform__input"
          />
        </div>

        {editing ? (
          <div className="adminform__group">
            <label className="adminform__label" htmlFor="pf-slug">
              URL slug (déjalo sin cambios a menos que quieras mover la página)
            </label>
            <input
              id="pf-slug"
              name="slug"
              defaultValue={product!.slug}
              className="adminform__input"
            />
          </div>
        ) : null}

        <div className="adminform__grid">
          <div className="adminform__group">
            <label className="adminform__label" htmlFor="pf-brand">
              Marca *
            </label>
            <select
              id="pf-brand"
              name="brandId"
              required
              defaultValue={product?.brandId ?? ""}
              className="adminform__select"
            >
              <option value="" disabled>
                Elegir marca…
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="adminform__group">
            <label className="adminform__label" htmlFor="pf-gender">
              Género
            </label>
            <select
              id="pf-gender"
              name="gender"
              defaultValue={product?.gender ?? "unisex"}
              className="adminform__select"
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="adminform__group">
            <label className="adminform__label" htmlFor="pf-kind">
              Tipo de producto
            </label>
            <select
              id="pf-kind"
              name="kind"
              defaultValue={product?.kind ?? "perfume"}
              className="adminform__select"
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>

          <div className="adminform__group">
            <label className="adminform__label" htmlFor="pf-size">
              Contenido (ml)
            </label>
            <input
              id="pf-size"
              name="sizeMl"
              type="number"
              min={0}
              max={2000}
              defaultValue={product?.sizeMl ?? ""}
              className="adminform__input"
            />
          </div>

          <div className="adminform__group">
            <label className="adminform__label" htmlFor="pf-price">
              Precio (CLP) *
            </label>
            <input
              id="pf-price"
              name="price"
              type="number"
              required
              min={1000}
              step={100}
              defaultValue={product?.price ?? ""}
              className="adminform__input"
            />
          </div>

          <div className="adminform__group">
            <label className="adminform__label" htmlFor="pf-compare">
              Precio de referencia (opcional, para el ticket de descuento)
            </label>
            <input
              id="pf-compare"
              name="compareAtPrice"
              type="number"
              min={0}
              step={100}
              defaultValue={product?.compareAtPrice ?? ""}
              className="adminform__input"
            />
          </div>
        </div>

        <div className="adminform__group">
          <label className="adminform__label">Destacados</label>
          <div className="adminform__checks">
            <label className="adminform__check">
              <input type="checkbox" name="isNew" defaultChecked={product?.isNew ?? false} />
              Nuevo
            </label>
            <label className="adminform__check">
              <input type="checkbox" name="isPopular" defaultChecked={product?.isPopular ?? false} />
              Popular
            </label>
            <label className="adminform__check">
              <input type="checkbox" name="isWanted" defaultChecked={product?.isWanted ?? false} />
              Lo más buscado
            </label>
          </div>
        </div>

        <div className="adminform__group">
          <label className="adminform__label">Temporada</label>
          <div className="adminform__checks">
            {TAG_OPTIONS.map((t) => (
              <label key={t.value} className="adminform__check">
                <input
                  type="checkbox"
                  name="tags"
                  value={t.value}
                  defaultChecked={flags.includes(t.value)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>

        <div className="adminform__group">
          <label className="adminform__label" htmlFor="pf-notes">
            Notas olfativas (separadas por coma: Bergamota, Lavanda, Almizcle)
          </label>
          <input
            id="pf-notes"
            name="notes"
            defaultValue={(product?.notes ?? []).join(", ")}
            className="adminform__input"
          />
        </div>

        <div className="adminform__group">
          <label className="adminform__label" htmlFor="pf-desc">
            Descripción
          </label>
          <textarea
            id="pf-desc"
            name="description"
            rows={5}
            maxLength={1200}
            defaultValue={product?.description ?? ""}
            className="adminform__textarea"
          />
        </div>
      </div>

      <aside className="adminform__side">
        <div className="adminform__group">
          <label className="adminform__label">
            Imagen del producto
          </label>
          <ImageUploader defaultUrl={product?.imageUrl} />
        </div>

        <div className="adminform__group">
          <label className="adminform__label" htmlFor="pf-stock">
            Stock inicial {editing ? "" : "(por defecto 20)"}
          </label>
          <input
            id="pf-stock"
            name="stock"
            type="number"
            min={0}
            step={1}
            defaultValue={product?.stock ?? ""}
            className="adminform__input"
          />
        </div>

        <div className="adminform__cta">
          <button type="submit" className="btn btn--block">
            {editing ? "Guardar cambios" : "Crear producto"}
          </button>
          <Link href="/admin/productos" className="btn btn--outline btn--block">
            Cancelar
          </Link>
          {editing ? (
            <DeleteButton action={deleteProduct} id={product!.id} name={product!.name} />
          ) : null}
        </div>
      </aside>
    </form>
  );
}
