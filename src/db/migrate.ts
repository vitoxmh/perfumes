/* Aplica los archivos SQL de ./drizzle en la base de Neon. Uso: npm run db:push */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { neon } from "@neondatabase/serverless";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

function splitStatements(content: string): string[] {
  // Drizzle separa sentencias con "--> statement-breakpoint"; el driver HTTP
  // de Neon solo acepta una sentencia por consulta.
  const parts = content
    .split("--> statement-breakpoint")
    .map((part) => part.trim())
    .filter(Boolean);

  const statements: string[] = [];
  for (const part of parts) {
    for (const statement of part.split(";").map((s) => s.trim()).filter(Boolean)) {
      statements.push(statement + ";");
    }
  }
  return statements;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Falta DATABASE_URL en .env.local");
    process.exit(1);
  }

  const dir = join(process.cwd(), "drizzle");
  if (!existsSync(dir)) {
    console.error("No hay migraciones generadas. Ejecuta: npm run db:generate");
    process.exit(1);
  }

  const sql = neon(url);

  // Reinicio: elimina tablas existentes (la BD debe ser exclusiva de esta app).
  console.info("Reiniciando tablas existentes…");
  await sql.query(
    "DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END $$;"
  );

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const content = readFileSync(join(dir, file), "utf8");
    console.info(`Aplicando ${file}…`);
    for (const statement of splitStatements(content)) {
      await sql.query(statement);
    }
    console.info(`OK ${file}`);
  }

  console.info("Migraciones aplicadas.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
