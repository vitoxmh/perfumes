import { createBanner, updateBanner, deleteBanner } from "@/lib/admin-actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { DeleteButton } from "@/components/admin/delete-button";
import type { Banner } from "@/db/schema";

export function BannerForm({ banner, isEditing = false }: { banner?: Banner; isEditing?: boolean }) {
  return (
    <form
      action={isEditing ? updateBanner : createBanner}
      className="adminform bannerform"
      aria-label={isEditing ? `Editar banner ${banner!.title}` : "Nuevo banner"}
    >
      {isEditing ? <input type="hidden" name="id" value={banner!.id} /> : null}

      <div className="adminform__main bannerform__main">
        <div className="adminform__grid">
          <div className="adminform__group">
            <label
              className="adminform__label"
              htmlFor={`bf-title-${isEditing ? banner!.id : "new"}`}
            >
              Título (grande en el slide) *
            </label>
            <input
              id={`bf-title-${isEditing ? banner!.id : "new"}`}
              name="title"
              required
              maxLength={80}
              defaultValue={banner?.title ?? ""}
              placeholder="Ej: Primavera 2026"
              className="adminform__input"
            />
          </div>

          <div className="adminform__group">
            <label className="adminform__label" htmlFor={`bf-sub-${isEditing ? banner!.id : "new"}`}>
              Subtítulo (línea pequeña)
            </label>
            <input
              id={`bf-sub-${isEditing ? banner!.id : "new"}`}
              name="subtitle"
              maxLength={120}
              defaultValue={banner?.subtitle ?? ""}
              placeholder="Ej: Fragancias frescas para mujer y hombre"
              className="adminform__input"
            />
          </div>

          <div className="adminform__group">
            <label className="adminform__label" htmlFor={`bf-cta-${isEditing ? banner!.id : "new"}`}>
              Texto del botón
            </label>
            <input
              id={`bf-cta-${isEditing ? banner!.id : "new"}`}
              name="cta"
              maxLength={40}
              defaultValue={banner?.cta ?? "Ver más"}
              placeholder="Ver más"
              className="adminform__input"
            />
          </div>

          <div className="adminform__group">
            <label className="adminform__label" htmlFor={`bf-href-${isEditing ? banner!.id : "new"}`}>
              Link del botón *
            </label>
            <input
              id={`bf-href-${isEditing ? banner!.id : "new"}`}
              name="href"
              required
              maxLength={300}
              defaultValue={banner?.href ?? ""}
              placeholder="/categoria/de-primavera-mujer"
              className="adminform__input"
            />
          </div>

          <div className="adminform__group">
            <label className="adminform__label" htmlFor={`bf-order-${isEditing ? banner!.id : "new"}`}>
              Orden (menor aparece primero)
            </label>
            <input
              id={`bf-order-${isEditing ? banner!.id : "new"}`}
              name="sortOrder"
              type="number"
              min={0}
              step={1}
              defaultValue={banner?.sortOrder ?? (isEditing ? 0 : "")}
              className="adminform__input"
            />
          </div>
        </div>

        <div className="adminform__group">
          <label className="adminform__label" htmlFor={`bf-active-${isEditing ? banner!.id : "new"}`}>
            <span className="adminform__check">
              <input
                id={`bf-active-${isEditing ? banner!.id : "new"}`}
                type="checkbox"
                name="active"
                defaultChecked={isEditing ? banner!.active : true}
              />
              Visible en la tienda
            </span>
          </label>
        </div>
      </div>

      <aside className="adminform__side bannerform__side">
        <div className="adminform__group">
          <label className="adminform__label">Imagen de fondo</label>
          <ImageUploader defaultUrl={banner?.imageUrl} />
        </div>

        {isEditing ? (
          <div className="bannerform__preview">
            <p className="adminform__label">Se ve así:</p>
            <div
              className="bannerform__mock"
              style={
                banner?.imageUrl
                  ? { backgroundImage: `url("${banner.imageUrl}")` }
                  : undefined
              }
            >
              <div className="bannerform__mock-panel">
                {banner?.subtitle ? <p className="bannerform__mock-sub">{banner.subtitle}</p> : null}
                <p className="bannerform__mock-title">{banner?.title ?? "Título"}</p>
                <span className="bannerform__mock-cta">{banner?.cta ?? "Ver más"}</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="adminform__cta">
          <button type="submit" className="btn btn--block">
            {isEditing ? "Guardar banner" : "Crear banner"}
          </button>
          {isEditing ? (
            <DeleteButton action={deleteBanner} id={banner!.id} name={banner!.title} />
          ) : null}
        </div>
      </aside>
    </form>
  );
}
