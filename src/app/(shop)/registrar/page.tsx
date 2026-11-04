import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { registerUser } from "@/lib/auth-actions";
import { googleReady } from "@/lib/auth-google";
import { safeInternalPath } from "@/lib/validation";

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
  intentos: "Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.",
  "google-no-config": "El ingreso con Google no está configurado en este servidor.",
};

export default async function RegisterPage({ searchParams }: { searchParams: RawSearch }) {
  const sp = await searchParams;
  const user = await getSessionUser();
  const next = safeInternalPath((Array.isArray(sp.next) ? sp.next[0] : sp.next) ?? "");
  if (user) redirect(next || "/");

  const errorKind = (Array.isArray(sp.error) ? sp.error[0] : sp.error) ?? "";
  const google = googleReady();

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

        {google ? (
          <>
            <p className="login__lead login__lead--divider">— o regístrate con —</p>
            <a href={`/api/auth/google/start${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="login__google">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </a>
          </>
        ) : null}

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
