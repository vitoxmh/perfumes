"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, sessionCookieValue, verifyPassword } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function safeNext(raw: string): string {
  // Solo rutas internas (evita redirect abierto).
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "";
}

async function setSessionCookie(userId: number): Promise<void> {
  const store = await cookies();
  store.set("session", sessionCookieValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    secure: process.env.NODE_ENV === "production",
  });
}

async function deleteSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete("session");
}

/* -------------------------------------------------------------- Registro */
export async function registerUser(formData: FormData): Promise<void> {
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

  const [created] = await db
    .insert(users)
    .values({
      email,
      name,
      phone: phone || null,
      passwordHash: hashPassword(password),
      role: "cliente",
    })
    .returning({ id: users.id });

  await setSessionCookie(created.id);
  redirect(next || "/");
}

/* ----------------------------------------------------------------- Login */
export async function loginUser(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  // Mensaje idéntico para email inexistente y clave errada (sin revelar cuál falló).
  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/ingresar?error=1&next=" + encodeURIComponent(next));
  }

  await setSessionCookie(user.id);
  redirect(next || "/");
}

/* ---------------------------------------------------------------- Logout */
export async function logoutUser(): Promise<void> {
  await deleteSessionCookie();
  redirect("/");
}
