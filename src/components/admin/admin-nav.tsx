"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/ordenes", label: "Órdenes" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="adminnav">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`adminnav__link ${pathname === l.href ? "adminnav__link--active" : ""}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
