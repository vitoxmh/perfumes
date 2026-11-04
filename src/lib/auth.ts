import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

const COOKIE_NAME = "session";
const SESSION_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>;

/* ------------------------------------------------------------------ Claves */

/** Secreto con el que se deriva el id de sesión (HMAC sobre el token de cookie). */
export function sessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      // Fail-fast: nunca firmar sesiones con una clave débil o por defecto.
      throw new Error(
        "[auth] AUTH_SECRET es obligatoria en producción (firma de sesiones). Defínela en .env.local."
      );
    }
    console.warn(
      "[auth] AUTH_SECRET no está definida; usando un secreto temporal de desarrollo. Define AUTH_SECRET en .env.local."
    );
    return "solo-desarrollo-no-usar-en-produccion";
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)).toString("hex");
  return `s1$${salt}$${hash}`;
}

export async function verifyPassword(input: string, stored: string): Promise<boolean> {
  const [format, salt, hash] = stored.split("$");
  if (format !== "s1" || !salt || !hash) return false;
  const candidate = await scryptAsync(input, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* --------------------------------------------------------------- Sesiones */

/**
 * El id en la BD es HMAC(secret, token): el token vive solo en la cookie
 * httpOnly y no se almacena en claro (un dump de la BD no permite restaurar
 * la cookie). La fila permite revocar y expirar la sesión en cada request.
 */
function tokenId(token: string): string {
  return createHmac("sha256", sessionSecret()).update(`v2.${token}`).digest("hex");
}

/** Crea una sesión revocable en la BD y deja su cookie. */
export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    secure: process.env.NODE_ENV === "production",
  });

  try {
    await db.insert(sessions).values({
      id: tokenId(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_MS),
    });
    // Limpieza oportunista de sesiones expiradas.
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  } catch (error) {
    console.error("[auth] No se pudo registrar la sesión en la BD:", error);
  }
}

/** Revoca la sesión (si existe) y borra la cookie. */
export async function destroySession(): Promise<void> {
  const token = await readSessionCookie();
  const store = await cookies();
  store.delete(COOKIE_NAME);

  if (token) {
    try {
      await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(eq(sessions.id, tokenId(token)));
    } catch {
      // Si la BD no responde, la cookie igualmente se elimina del navegador.
    }
  }
}

async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  // Token de 32 bytes en hex (las cookies antiguas "{id}.{exp}.{firma}" dejan de ser válidas).
  if (!raw || !/^[0-9a-f]{64}$/.test(raw)) return null;
  return raw;
}

export type SessionUser = Pick<User, "id" | "email" | "name" | "phone" | "role">;

/** Usuario de la sesión actual (o null si no hay sesión / la DB no responde). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await readSessionCookie();
  if (!token) return null;
  try {
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.id, tokenId(token)),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function isAdminUser(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.role === "admin";
}

/**
 * Guardia del panel: requiere sesión con rol admin; si no,
 * redirige a /ingresar (volviendo a la vista previa si se indica).
 */
export async function requireAdminUser(next?: string): Promise<void> {
  if (!(await isAdminUser())) {
    redirect(next ? `/ingresar?next=${encodeURIComponent(next)}` : "/ingresar");
  }
}
