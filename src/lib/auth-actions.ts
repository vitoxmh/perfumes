"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import {
  isUniqueViolation,
  safeInternalPath,
  clientIpKey,
  rateLimit,
} from "@/lib/validation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function safeNext(raw: string): string {
  return safeInternalPath(raw);
}

/* -------------------------------------------------------------- Registro */
export async function registerUser(formData: FormData): Promise<void> {
  // Máx. 5 registros por hora por IP (frena cuentas basura y enumeración).
  if (!rateLimit(await clientIpKey("registro"), 5, 60 * 60 * 1000)) {
    redirect("/registrar?error=intentos");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  if (name.length < 2 || name.length > 80) redirect("/registrar?error=nombre");
  if (!EMAIL_RE.test(email) || email.length > 160) redirect("/registrar?error=email&next=" + encodeURIComponent(next));
  if (password.length < 8) redirect("/registrar?error=clave&next=" + encodeURIComponent(next));
  if (phone && phone.length > 40) redirect("/registrar?error=telefono&next=" + encodeURIComponent(next));

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) redirect("/registrar?error=duplicado&next=" + encodeURIComponent(next));

  let created: { id: number };
  try {
    [created] = await db
      .insert(users)
      .values({
        email,
        name,
        phone: phone || null,
        passwordHash: await hashPassword(password),
        role: "cliente",
      })
      .returning({ id: users.id });
  } catch (error) {
    // Carrera check-then-insert: dos registros concurrentes del mismo email.
    if (isUniqueViolation(error)) {
      redirect("/registrar?error=duplicado&next=" + encodeURIComponent(next));
    }
    throw error;
  }

  await createSession(created.id);
  redirect(next || "/");
}

/* ----------------------------------------------------------------- Login */
export async function loginUser(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  // Fuerza bruta: 10 intentos/10 min por IP y 6 por email.
  const ipOk = rateLimit(await clientIpKey("login-ip"), 10, 10 * 60 * 1000);
  const emailOk = rateLimit(`login-email:${email}`, 6, 10 * 60 * 1000);
  if (!ipOk || !emailOk) {
    redirect("/ingresar?error=intentos&next=" + encodeURIComponent(next));
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  // Mensaje idéntico para email inexistente y clave errada (sin revelar cuál falló).
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/ingresar?error=1&next=" + encodeURIComponent(next));
  }

  await createSession(user.id);
  redirect(next || "/");
}

/* ---------------------------------------------------------------- Logout */
export async function logoutUser(): Promise<void> {
  await destroySession();
  redirect("/");
}
