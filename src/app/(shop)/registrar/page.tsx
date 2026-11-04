import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { registerUser } from "@/lib/auth-actions";

export const metadata = {
  title: "Crear cuenta",
};

type RawSearch = Promise<Record<string, string | string[] | undefined>>;

const ERROR_TEXTS: Record<string, string> = {
  nombre: "Ingresa un nombre válido (mínimo 2 letras).",
  email: "Ingresa un email válido.",
  clave: "La clave debe tener al menos 8 caracteres.",
  telefono: "El teléfono ingresado no es válido.",
  duplicado: "Ese email ya está registrado. Ingresa sesión o usa otro email.",
};

export default async function RegisterPage({ searchParams }: { searchParams: RawSearch }) {
  const sp = await searchParams;
  const user = await getSessionUser();
  const nextRaw = (Array.isArray(sp.next) ? sp.next[0] : sp.next) ?? "";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "";
  if (user) redirect(next || "/");

  const errorKind = (Array.isArray(sp.error) ? sp.error[0] : sp.error) ?? "";

  return (
    <div className="login">
      <form action={registerUser} className="login__card">
        <h1 className="login__title">Crear cuenta</h1>
        <p className="login__lead">Tu teléfono y datos se autocompletan de aquí en adelante.</p>

        {errorKind ? (
          <p className="login__error">{ERROR_TEXTS[errorKind] ?? "Revisa los datos y reintenta."}</p>
        ) : null}

        <input type="hidden" name="next" value={next} />

        <label className="login__label" htmlFor="name">
          Nombre completo
        </label>
        <input id="name" name="name" required minLength={2} maxLength={80} autoFocus className="login__input" />

        <label className="login__label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required maxLength={160} className="login__input" />

        <label className="login__label" htmlFor="phone">
          Teléfono (WhatsApp) <span className="login__optional">opcional</span>
        </label>
        <input id="phone" name="phone" maxLength={40} className="login__input" />

        <label className="login__label" htmlFor="password">
          Clave (mínimo 8 caracteres)
        </label>
        <input id="password" name="password" type="password" required minLength={8} className="login__input" />

        <button type="submit" className="btn btn--block login__submit">
          Crear mi cuenta
        </button>

        <p className="login__foot">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={next ? `/ingresar?next=${encodeURIComponent(next)}` : "/ingresar"}
            className="login__foot-link"
          >
            Ingresar
          </Link>
        </p>
      </form>
    </div>
  );
}
