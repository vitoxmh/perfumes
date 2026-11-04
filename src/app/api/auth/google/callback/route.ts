import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual, randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { exchangeGoogleCode, googleRedirectUri, googleReady } from "@/lib/auth-google";
import { isUniqueViolation, safeInternalPath } from "@/lib/validation";

/** Contraseña inutilizable: las cuentas de Google no usan login por clave. */
function oauthPlaceholder(): string {
  return `oauth2:${randomBytes(32).toString("hex")}`;
}

/** Redirige a /ingresar con el error indicado, conservando la ruta de retorno. */
function failRedirect(origin: string, reason: string, next: string): NextResponse {
  const url = new URL("/ingresar", origin);
  url.searchParams.set("error", reason);
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url.toString());
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const denied = url.searchParams.get("error");

  const store = await cookies();
  const expectedState = store.get("g_state")?.value ?? "";
  const next = safeInternalPath(store.get("g_next")?.value ?? "");

  // Las cookies de estado se consumen siempre (uso único, ventana de 10 min).
  store.delete("g_state");
  store.delete("g_next");

  const fail = (reason: string) => failRedirect(url.origin, reason, next);

  if (denied) {
    // El usuario canceló el consentimiento: no es un error técnico.
    return fail("google-cancelado");
  }

  if (!googleReady() || !code || !expectedState || !state) {
    return fail("google");
  }

  // State anti-CSRF: comparación constante en tiempo y de un solo uso.
  const sigBuf = Buffer.from(state);
  const expBuf = Buffer.from(expectedState);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return fail("google");
  }

  let profile = null;
  try {
    profile = await exchangeGoogleCode(code, await googleRedirectUri());
  } catch (error) {
    console.error("[google] fallo de intercambio de code:", error);
    return fail("google");
  }

  if (!profile || !profile.emailVerified) {
    // Sin email verificado por Google no hay login ni vinculación de cuenta.
    return fail("google");
  }

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1);

    if (existing) {
      // Cuenta existente (con clave o Google): entra directo con su rol actual.
      await createSession(existing.id);
      return NextResponse.redirect(new URL(next || "/", url.origin).toString());
    }

    // Sin cuenta: registro automático con el nombre del perfil de Google.
    const name = (profile.name || profile.email.split("@")[0]).slice(0, 80);
    let userId: number;
    try {
      const [created] = await db
        .insert(users)
        .values({
          email: profile.email,
          name,
          phone: null,
          passwordHash: oauthPlaceholder(),
          role: "cliente",
        })
        .returning({ id: users.id });
      userId = created.id;
    } catch (error) {
      // Carrera: otro callback creó la misma cuenta a la vez.
      if (!isUniqueViolation(error)) throw error;
      const [race] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, profile.email))
        .limit(1);
      if (!race) throw error;
      userId = race.id;
    }

    await createSession(userId);
    return NextResponse.redirect(new URL(next || "/", url.origin).toString());
  } catch (error) {
    console.error("[google] fallo de BD en callback:", error);
    return fail("google");
  }
}
