import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { loginUser } from "@/lib/auth-actions";

export const metadata = {
  title: "Ingresar",
};

type RawSearch = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: RawSearch }) {
  const sp = await searchParams;
  const user = await getSessionUser();
  const nextRaw = (Array.isArray(sp.next) ? sp.next[0] : sp.next) ?? "";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "";
  if (user) redirect(next || "/");

  const hasError = (Array.isArray(sp.error) ? sp.error[0] : sp.error) === "1";

  return (
    <div className="login">
      <form action={loginUser} className="login__card">
        <h1 className="login__title">Ingresar</h1>
        <p className="login__lead">
          Puedes comprar sin cuenta, pero registrarte guarda tus datos para futuros pedidos.
        </p>

        {hasError ? (
          <p className="login__error">Email o clave incorrectos. Inténtalo de nuevo.</p>
        ) : null}

        <input type="hidden" name="next" value={next} />

        <label className="login__label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required maxLength={160} autoFocus className="login__input" />

        <label className="login__label" htmlFor="password">
          Clave
        </label>
        <input id="password" name="password" type="password" required className="login__input" />

        <button type="submit" className="btn btn--block login__submit">
          Ingresar
        </button>

        <p className="login__foot">
          ¿No tienes cuenta?{" "}
          <Link
            href={next ? `/registrar?next=${encodeURIComponent(next)}` : "/registrar"}
            className="login__foot-link"
          >
            Crear cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}
