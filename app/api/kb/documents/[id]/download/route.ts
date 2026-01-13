import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await ctx.params; // ✅ Next: params може бути Promise

  const a = await auth(); // ✅ ВАЖЛИВО: auth() треба await
  const token = await a.getToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const API = process.env.NEXT_PUBLIC_API_URL;
  if (!API) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is missing" },
      { status: 500 },
    );
  }

  const url = `${API}/knowledge-base/documents/${id}/download`;

  const upstream = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      { message: "Upstream error", status: upstream.status, details: text },
      { status: upstream.status },
    );
  }

  const arrayBuffer = await upstream.arrayBuffer();

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";

  const disposition =
    upstream.headers.get("content-disposition") ??
    'attachment; filename="document"';

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    },
  });
}
