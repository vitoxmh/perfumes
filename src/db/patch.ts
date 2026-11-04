/* Aplica cambios de esquema SIN reiniciar la base (a diferencia de db:push, que
   elimina todas las tablas). Por ahora: tabla images + tabla users con la
   cuenta admin semilla. Uso: npm run db:patch */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Mismo formato que src/lib/auth.ts: "s1$sal-hex$hash-hex" */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `s1$${salt}$${hash}`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Falta DATABASE_URL en .env.local");
    process.exit(1);
  }
  const sql = neon(url);

  console.info("Creando tabla images (si no existe)…");
  await sql.query(`
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      mime TEXT NOT NULL,
      "data" TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  console.info("Creando tabla users (si no existe)…");
  await sql.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cliente',
      created_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@perfumes.cl").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const adminName = process.env.ADMIN_NAME ?? "Administrador Perfumes.cl";

  // Semilla: si no existe el usuario admin, se crea; si existe solo se
  // actualiza el rol (la clave la cambia quien administre .env.local).
  const [existing] = await sql.query(
    `SELECT id FROM users WHERE lower(email) = $1 LIMIT 1`,
    [adminEmail]
  );
  if (existing) {
    await sql.query(`UPDATE users SET role = 'admin' WHERE id = $1`, [existing.id]);
    console.info(`Admin ya existía (id ${existing.id}): rol confirmado.`);
  } else {
    const [created] = await sql.query(
      `INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, 'admin') RETURNING id`,
      [adminEmail, adminName, hashPassword(adminPassword)]
    );
    console.info(`Cuenta admin creada: id ${created.id} · ${adminEmail} (clave: ADMIN_PASSWORD de .env.local)`);
  }

  console.info("Creando tabla banners (si no existe)…");
  await sql.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      cta TEXT NOT NULL DEFAULT 'Ver más',
      href TEXT NOT NULL,
      image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  console.info("OK. Esquema parchado.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
