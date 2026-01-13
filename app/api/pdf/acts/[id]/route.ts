import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await ctx.params; // ✅ Next 16: params може бути Promise

  const a = await auth();
  const token = await a.getToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const API = process.env.NEXT_PUBLIC_API_URL;
  const url = `${API}/acts/${id}/pdf`;

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

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition":
        upstream.headers.get("content-disposition") ??
        'inline; filename="act.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
