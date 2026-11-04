import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";

const COOKIE_NAME = "session";
const SESSION_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

/** Secreto con el que se firma la cookie de sesión. */
export function sessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.warn(
      "[auth] AUTH_SECRET no está definida; usando la ADMIN_PASSWORD como firma. Define AUTH_SECRET en .env.local."
    );
    return process.env.ADMIN_PASSWORD ?? "admin123";
  }
  return secret;
}

/* ------------------------------------------------------------------ Claves */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `s1$${salt}$${hash}`;
}

export function verifyPassword(input: string, stored: string): boolean {
  const [format, salt, hash] = stored.split("$");
  if (format !== "s1" || !salt || !hash) return false;
  const candidate = scryptSync(input, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* --------------------------------------------------------------- Sesiones */

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

/** Valor de la cookie: "{userId}.{expiraMs}.{firma}" */
export function sessionCookieValue(userId: number): string {
  const expires = Date.now() + SESSION_MS;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

async function readSessionCookie(): Promise<number | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [idPart, expPart, signature] = parts;

  const expected = sign(`${idPart}.${expPart}`);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

  const id = Number(idPart);
  const expires = Number(expPart);
  if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(expires) || expires < Date.now()) {
    return null;
  }
  return id;
}

export type SessionUser = Pick<User, "id" | "email" | "name" | "phone" | "role">;

/** Usuario de la sesión actual (o null si no hay sesión / la DB no responde). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const id = await readSessionCookie();
  if (!id) return null;
  try {
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, id))
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
