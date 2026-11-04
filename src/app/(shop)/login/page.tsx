import { redirect } from "next/navigation";

type RawSearch = Promise<Record<string, string | string[] | undefined>>;

/** /login era la ruta del panel antiguo: se mantiene como alias de /ingresar. */
export default async function LoginAliasPage({ searchParams }: { searchParams: RawSearch }) {
  const sp = await searchParams;
  const next = (Array.isArray(sp.next) ? sp.next[0] : sp.next) ?? "";
  redirect(next.startsWith("/") && !next.startsWith("//") ? `/ingresar?next=${encodeURIComponent(next)}` : "/ingresar");
}
