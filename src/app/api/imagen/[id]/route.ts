import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { images } from "@/db/schema";

type RouteParams = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: RouteParams }) {
  const { id } = await params;
  const imageId = Number(id);
  if (!Number.isInteger(imageId) || imageId <= 0) {
    return new NextResponse(null, { status: 404 });
  }

  const [row] = await db.select().from(images).where(eq(images.id, imageId)).limit(1);
  if (!row) {
    return new NextResponse(null, { status: 404 });
  }

  const body = Buffer.from(row.data, "base64");
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
