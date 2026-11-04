import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

export function getDbUrlFromEnv(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Créala en https://neon.tech y define DATABASE_URL en .env.local"
    );
  }
  return url;
}

export const sql = neon(getDbUrlFromEnv());
export const db = drizzle(sql, { schema });
