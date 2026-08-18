import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const report = await prisma.report.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        pdfUrl: true,
        createdAt: true,
        updatedAt: true,
        client: { select: { name: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: report.id,
      title: `SEO Performance Report`,
      status: report.status,
      pdfUrl: report.pdfUrl,
      clientName: report.client?.name,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    });
  } catch (error) {
    console.error("Get report status error:", error);
    return NextResponse.json({ error: "Failed to get report status" }, { status: 500 });
  }
}
