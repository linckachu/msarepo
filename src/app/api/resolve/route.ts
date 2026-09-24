import { NextRequest, NextResponse } from "next/server";
import { resolveDizipalPlayer } from "@/lib/dizipal";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sourceUrl = request.nextUrl.searchParams.get("url");
  if (!sourceUrl) {
    return NextResponse.json({ error: "Kaynak adresi gerekli." }, { status: 400 });
  }

  try {
    const playerUrl = await resolveDizipalPlayer(sourceUrl);
    return NextResponse.json(
      { playerUrl },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Oynatıcı çözümlenemedi.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
