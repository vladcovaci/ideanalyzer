import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Mark all non-completed conversations as completed
    await prisma.conversation.updateMany({
      where: {
        userId: session.user.id,
        status: { not: "completed" },
      },
      data: {
        status: "completed",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset conversation:", error);
    return NextResponse.json(
      { error: "Failed to reset conversation" },
      { status: 500 }
    );
  }
}
