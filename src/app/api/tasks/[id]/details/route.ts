import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { 
        agent: true,
        provider: true,
        decision: true
      }
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error("Error fetching task details:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
