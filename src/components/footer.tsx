import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <p className="footer__brand">
            <span className="footer__brand-badge" />
            PERFUMES<span className="footer__brand-accent">.CL</span>
          </p>
          <p className="footer__tagline">
            Tienda de perfumería árabe auténtica. Distribuidor oficial con
            unidades originales y garantizadas.
          </p>
        </div>
        <div>
          <p className="footer__title">Categorías</p>
          <ul className="footer__list">
            <li><Link className="footer__link" href="/categoria/mujer">Mujer</Link></li>
            <li><Link className="footer__link" href="/categoria/hombre">Hombre</Link></li>
            <li><Link className="footer__link" href="/categoria/unisex">Unisex</Link></li>
            <li><Link className="footer__link" href="/categoria/perfumes-arabes">Todas las fragancias</Link></li>
          </ul>
        </div>
        <div>
          <p className="footer__title">Ayuda</p>
          <ul className="footer__list">
            <li><Link className="footer__link" href="/seguimiento">Seguimiento de pedido</Link></li>
            <li><Link className="footer__link" href="/detectar-falsos">Detectar falsificaciones</Link></li>
            <li><Link className="footer__link" href="/nuestra-tienda">Nuestras tiendas</Link></li>
            <li><Link className="footer__link" href="/admin">Administración</Link></li>
          </ul>
        </div>
        <div>
          <p className="footer__title">Contacto</p>
          <p className="footer__contact">
            Lunes a sábado, 10:00–19:00 hrs
            <br />
            contacto@perfumes.cl
          </p>
          <p className="footer__note">
            Los pagos por débito y crédito se procesan en verde con tarifas oficiales.
          </p>
        </div>
      </div>
      <div className="footer__bottom">
        © {new Date().getFullYear()} Perfumes.cl — Todos los derechos reservados.
      </div>
    </footer>
  );
}
