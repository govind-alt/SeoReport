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

    // Delete existing competitors and recreate
    await prisma.competitor.deleteMany({ where: { clientId } });

    for (const comp of competitors) {
      const compName = typeof comp === 'string' ? comp : (comp.name || comp.domain || 'Competitor');
      const compDomain = typeof comp === 'string' ? comp : (comp.domain || comp.name || 'competitor.com');
      await prisma.competitor.create({
        data: {
          clientId,
          name: compName,
          domain: compDomain,
        }
      });
    }

    const updatedCompetitors = await prisma.competitor.findMany({ where: { clientId } });
    return NextResponse.json({ success: true, competitors: updatedCompetitors });
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
    const competitors = await prisma.competitor.findMany({
      where: { clientId },
    });

    return NextResponse.json({ competitors });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get competitors" }, { status: 500 });
  }
}
