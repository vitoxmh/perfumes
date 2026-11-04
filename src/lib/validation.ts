import { headers } from "next/headers";

/* --------------------------------------------------- Validaciones básicas */

/** Rutas internas seguras para redirects: evita open redirect (https:// y \\). */
export function safeInternalPath(raw: string): string {
  const value = String(raw).trim();
  return value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    value.length < 300
    ? value
    : "";
}

/** Códigos de pedido válidos: LP- seguido de 6–32 hexadecimales en mayúsculas. */
export const ORDER_CODE_RE = /^LP-[0-9A-F]{6,32}$/;

/** Escapa comodines de LIKE/ILIKE (% _) y el carácter de escape, para búsquedas de usuario. */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, "\\$&");
}

/** Detecta violación de unicidad de Postgres (SQLSTATE 23505). */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "23505"
  );
}

/* ------------------------------------------- Rate limiting de ventana fija */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Límite en memoria, por instancia del server. Suficiente para frenar abuso
 * básico de credenciales/enumeración; si se escala a varias instancias,
 * mover a un store compartido (Redis/Upstash).
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hit = buckets.get(key);

  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (hit.count >= limit) return false;
  hit.count += 1;

  // Barrido oportunista para que el Map no crezca indefinidamente.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }
  return true;
}

/** Clave por IP del cliente (detrás de un proxy/CDN: primer valor de x-forwarded-for). */
export async function clientIpKey(prefix: string): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return `${prefix}:${ip}`;
}
