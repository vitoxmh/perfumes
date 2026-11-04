import { NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";
import { isAdminUser } from "@/lib/auth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 1_500_000;

function safeName(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 60) || "imagen"
  );
}

export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let file: File;
  try {
    const form = await request.formData();
    const candidate = form.get("file");
    if (!(candidate instanceof File)) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
    }
    file = candidate;
  } catch {
    return NextResponse.json({ error: "Formulario inválido" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Formato no permitido (usa JPG, PNG o WEBP)" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagen demasiado grande (máx. 1.5 MB)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const [row] = await db
    .insert(images)
    .values({
      filename: safeName(file.name),
      mime: file.type,
      data: buffer.toString("base64"),
    })
    .returning({ id: images.id });

  return NextResponse.json({ id: row.id, url: `/api/imagen/${row.id}` });
}
