"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { logoutUser } from "@/lib/auth-actions";
import type { Brand } from "@/db/schema";
import type { SessionUser } from "@/lib/auth";

const GENDER_LINKS = [
  { label: "Mujer", href: "/categoria/mujer" },
  { label: "Hombre", href: "/categoria/hombre" },
  { label: "Unisex", href: "/categoria/unisex" },
  { label: "Set", href: "/categoria/set" },
];

const KIND_LINKS = [
  { label: "Desodorantes corporales", href: "/categoria/desodorante-corporal" },
  { label: "Desodorantes ambientales", href: "/categoria/desodorant-ambiental" },
  { label: "Todas las fragancias", href: "/categoria/perfumes-arabes" },
];

const TEMPORADA_LINKS = [
  { label: "🌷 De primavera mujer", href: "/categoria/de-primavera-mujer" },
  { label: "☀️ De primavera hombre", href: "/categoria/de-primavera-hombre" },
  { label: "❄️ De invierno", href: "/categoria/de-invierno" },
];

const PRICE_LINKS = [
  { label: "Menos de $15.000", href: "/categoria/perfumes-arabes?precio=0-15000" },
  { label: "$15.000 hasta $20.000", href: "/categoria/perfumes-arabes?precio=15000-20000" },
  { label: "$20.000 hasta $25.000", href: "/categoria/perfumes-arabes?precio=20000-25000" },
  { label: "$25.000 hasta $30.000", href: "/categoria/perfumes-arabes?precio=25000-30000" },
  { label: "Más de $30.000", href: "/categoria/perfumes-arabes?precio=30000" },
];

export function Header({ brands, user }: { brands: Brand[]; user: SessionUser | null }) {
  const { count } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="header__logo">
          <span className="header__logo-badge" />
          PERFUMES<span className="header__logo-accent">.CL</span>
        </Link>

        <form
          className="header__search"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) {
              router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
              setQ("");
            }
          }}
        >
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Búsqueda de productos"
            aria-label="Búsqueda de productos"
            className="header__search-input"
          />
        </form>

        <nav className="header__nav">
          <Link href="/seguimiento" className="header__nav-link header__nav-link--tracking">
            Seguimiento
          </Link>
          <Link
            href="/carrito"
            className="header__nav-link header__nav-link--cart"
            aria-label={`Carrito, ${count} productos`}
          >
            <svg
              className="header__cart-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="header__cart-count">{count}</span>
          </Link>
          {user?.role === "admin" ? (
            <Link href="/admin" className="header__nav-link header__nav-link--admin">
              Panel
            </Link>
          ) : null}
          {user ? (
            <form action={logoutUser} className="header__user">
              <Link
                href="/carrito"
                className="header__nav-user"
                title={`Conectado como ${user.name}`}
              >
                👋 {user.name.split(" ")[0]}
              </Link>
              <button type="submit" className="header__signout">
                Salir
              </button>
            </form>
          ) : (
            <>
              <Link href="/ingresar" className="header__nav-link">
                Ingresar
              </Link>
              <Link href="/registrar" className="header__nav-link header__nav-link--register">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="header__menu" onMouseLeave={() => setOpenMenu(null)}>
        <div className="header__menu-row">
          <span
            className="header__menu-trigger"
            onMouseEnter={() => setOpenMenu("fragancias")}
          >
            FRAGANCIAS ▾
          </span>
          <span
            className="header__menu-trigger"
            onMouseEnter={() => setOpenMenu("marcas")}
          >
            MARCAS ▾
          </span>
          <Link href="/categoria/perfumes-arabes?orderby=date" className="header__menu-link">
            NOVEDADES
          </Link>
          <Link href="/nuestra-tienda" className="header__menu-link header__menu-link--stores">
            TIENDAS
          </Link>
          <Link href="/categoria/desodorante-corporal" className="header__menu-link">
            DESODORANTES
          </Link>
        </div>

        {openMenu === "fragancias" ? (
          <div className="megamenu">
            <div className="megamenu__grid">
              <div>
                <p className="megamenu__title">Por género</p>
                <ul className="megamenu__list">
                  {GENDER_LINKS.map((l) => (
                    <li key={l.href} className="megamenu__item">
                      <Link href={l.href} onClick={() => setOpenMenu(null)}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="megamenu__title">Temporada</p>
                <ul className="megamenu__list">
                  {TEMPORADA_LINKS.map((l) => (
                    <li key={l.href} className="megamenu__item">
                      <Link href={l.href} onClick={() => setOpenMenu(null)}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="megamenu__title">Desodorantes</p>
                <ul className="megamenu__list">
                  {KIND_LINKS.map((l) => (
                    <li key={l.href} className="megamenu__item">
                      <Link href={l.href} onClick={() => setOpenMenu(null)}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="megamenu__title">Por precio</p>
                <ul className="megamenu__list">
                  {PRICE_LINKS.map((l) => (
                    <li key={l.href} className="megamenu__item">
                      <Link href={l.href} onClick={() => setOpenMenu(null)}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {openMenu === "marcas" ? (
          <div className="megamenu">
            <ul className="megamenu__grid">
              {brands.map((b) => (
                <li key={b.slug} className="megamenu__item">
                  <Link
                    href={`/marca/${b.slug}`}
                    onClick={() => setOpenMenu(null)}
                    className="megamenu__item-letter"
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </header>
  );
}
