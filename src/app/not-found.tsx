import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Esta fragancia no existe</h1>
      <p className="not-found__text">
        La página que buscas no se encuentra. Vuelve al inicio o explora el catálogo.
      </p>
      <Link
        href="/categoria/perfumes-arabes"
        className="btn not-found__action"
      >
        Ver catálogo
      </Link>
    </div>
  );
}
