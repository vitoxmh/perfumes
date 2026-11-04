import { headers } from "next/headers";

/* --------------------------------------------- Configuración (env vars) */

export function googleConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

/** true si el botón "Continuar con Google" debe mostrarse. */
export function googleReady(): boolean {
  return googleConfig() !== null;
}

/** URI de callback según el host que atiende la request (proxy/CDN aware). */
export async function googleRedirectUri(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/api/auth/google/callback`;
}

/* ------------------------------------------------------- Google endpoints */

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
export const GOOGLE_SCOPE = "openid email profile";

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
};

/** Intercambia el code por un access_token y devuelve el perfil verificado. */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<GoogleProfile | null> {
  const cfg = googleConfig();
  if (!cfg) return null;

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return null;
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) return null;

  const infoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) return null;

  const info = (await infoRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (!info.sub || !info.email) return null;
  return {
    sub: info.sub,
    email: info.email.trim().toLowerCase(),
    // Solo confiamos en el email cuando Google confirma que es del dueño.
    emailVerified: info.email_verified === true,
    name: (info.name ?? "").trim(),
  };
}
