import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import {
  GOOGLE_AUTH_URL,
  GOOGLE_SCOPE,
  googleRedirectUri,
  googleReady,
} from "@/lib/auth-google";
import { safeInternalPath, clientIpKey, rateLimit } from "@/lib/validation";

/**
 * Inicio del flujo Google OAuth: guarda un state anti-CSRF en una cookie
 * httpOnly (junto con la ruta de retorno) y manda al consentimiento.
 */
export async function GET(request: Request) {
  if (!googleReady()) {
    redirect("/ingresar?error=google-no-config");
  }

  // Freno básico frente a abuso del endpoint.
  if (!rateLimit(await clientIpKey("google-start"), 20, 10 * 60 * 1000)) {
    redirect("/ingresar?error=intentos");
  }

  const state = randomBytes(16).toString("hex");
  const next = safeInternalPath(new URL(request.url).searchParams.get("next") ?? "");

  const store = await cookies();
  store.set("g_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // vale 10 minutos
    secure: process.env.NODE_ENV === "production",
  });
  if (next) {
    store.set("g_next", next, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
      secure: process.env.NODE_ENV === "production",
    });
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: await googleRedirectUri(),
    response_type: "code",
    scope: GOOGLE_SCOPE,
    state,
    // Siempre elegir cuenta: evita "me loguea con la sesión anterior de Google".
    prompt: "select_account",
    access_type: "online",
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}
