import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, props: any) {
  return handlers.GET(req, props);
}

export async function POST(req: NextRequest, props: any) {
  return handlers.POST(req, props);
}
