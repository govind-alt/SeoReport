import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { competitors } = await req.json();

    if (!Array.isArray(competitors)) {
      return NextResponse.json({ error: "competitors must be an array" }, { status: 400 });
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { competitors: JSON.stringify(competitors) },
    });

    return NextResponse.json({ success: true, competitors });
  } catch (error) {
    console.error("Update competitors error:", error);
    return NextResponse.json({ error: "Failed to update competitors" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { competitors: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const competitors = client.competitors ? JSON.parse(client.competitors) : [];
    return NextResponse.json({ competitors });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get competitors" }, { status: 500 });
  }
}
