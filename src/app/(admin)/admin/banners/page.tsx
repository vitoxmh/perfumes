import type { Metadata } from "next";
import { adminBanners } from "@/lib/admin-queries";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata: Metadata = { title: "Banners" };

type RawSearch = Promise<Record<string, string | string[] | undefined>>;

const OK_TEXTS: Record<string, string> = {
  creado: "✓ Banner creado. Ya aparece en el carrusel de la tienda.",
  guardado: "✓ Cambios guardados.",
  eliminado: "✓ Banner eliminado.",
};

const ERROR_TEXTS: Record<string, string> = {
  titulo: "El banner necesita un título.",
  link: "El link del botón no es válido (usa rutas internas como /categoria/…).",
  banner: "No se encontró el banner.",
};

export default async function AdminBannersPage({ searchParams }: { searchParams: RawSearch }) {
  const sp = await searchParams;
  const ok = (Array.isArray(sp.ok) ? sp.ok[0] : sp.ok) ?? "";
  const errorKind = (Array.isArray(sp.error) ? sp.error[0] : sp.error) ?? "";

  const items = await adminBanners();

  return (
    <>
      <h1 className="admin__title">Banners del carrusel ({items.length})</h1>

      {ok && OK_TEXTS[ok] ? <p className="admin-alert admin-alert--ok">{OK_TEXTS[ok]}</p> : null}
      {errorKind ? (
        <p className="admin-alert admin-alert--warn">{ERROR_TEXTS[errorKind] ?? "Revisa los datos."}</p>
      ) : null}

      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">+ Nuevo banner</h2>
        </div>
        <div className="admin-card__body">
          <BannerForm />
        </div>
      </section>

      {items.map((banner) => (
        <section key={banner.id} className="admin-card">
          <div className="admin-card__head">
            <div className="admin-card__banner-meta">
              <h2 className="admin-card__title">{banner.title}</h2>
              <span
                className={`admin-pill ${banner.active ? "admin-pill--ok" : "admin-pill--danger"}`}
              >
                {banner.active ? "visible" : "oculto"}
              </span>
            </div>
            <p className="admin-card__meta">
              Orden {banner.sortOrder} · {banner.href}
            </p>
          </div>
          <div className="admin-card__body">
            <BannerForm banner={banner} isEditing />
          </div>
        </section>
      ))}

      {items.length === 0 ? (
        <div className="admin-card">
          <p className="admin-card__empty">
            Aún no hay banners: la tienda muestra su diseño de inicio predeterminado hasta que crees
            uno.
          </p>
        </div>
      ) : null}
    </>
  );
}
