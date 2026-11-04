import { HeroCarousel } from "@/components/hero-carousel";
import { ProductsSection, WantedStrip } from "@/components/product-grid";
import { activeBanners, newProducts, popularProducts, wantedProducts, allBrands } from "@/lib/queries";

export const dynamic = "force-dynamic";

function SetupNotice() {
  return (
    <section className="setup-notice">
      <div className="setup-notice__box">
        <p className="setup-notice__icon">🗄️</p>
        <h2 className="setup-notice__title">Configura tu base de datos</h2>
        <p className="setup-notice__text">
          Aún no hay conexión con la base de datos de Neon. Crea tu base en{" "}
          <a href="https://neon.tech" className="setup-notice__link">
            neon.tech
          </a>
          , pega la cadena de conexión en <code>.env.local</code> y ejecuta{" "}
          <code>npm run db:push</code> y <code>npm run db:seed</code>.
        </p>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const brands = await allBrands();
  const [news, popular, wanted, banners] = await Promise.all([
    newProducts(12),
    popularProducts(12),
    wantedProducts(10),
    activeBanners(),
  ]);

  return (
    <div className="home">
      <div className="home__hero">
        <HeroCarousel slides={banners} />
      </div>

      {news.length === 0 && popular.length === 0 ? (
        <SetupNotice />
      ) : (
        <>
          <ProductsSection
            title="Lo más nuevo"
            subtitle="Explora las últimas tendencias: nuevos lanzamientos, fragancias exclusivas y las esencias que se están marcando la diferencia."
            moreHref="/categoria/perfumes-arabes?orderby=date"
            products={news}
            brands={brands}
          />

          <WantedStrip wanted={wanted} />

          <ProductsSection
            title="Los más populares"
            subtitle="Encuentra los perfumes más vendidos y las fragancias preferidas de nuestra comunidad."
            moreHref="/categoria/perfumes-arabes?orderby=popularity"
            products={popular}
            brands={brands}
          />
        </>
      )}
    </div>
  );
}
