import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

// Toggle brief sharing status
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const briefId = id;

    // Find the brief and verify ownership
    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      select: { userId: true, isPublic: true, shareToken: true },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    if (brief.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Toggle public status
    const isPublic = !brief.isPublic;

    // Generate share token if making public and no token exists
    const shareToken = isPublic && !brief.shareToken
      ? nanoid(16)
      : brief.shareToken;

    // Update the brief
    const updatedBrief = await prisma.brief.update({
      where: { id: briefId },
      data: {
        isPublic,
        shareToken,
      },
      select: {
        id: true,
        isPublic: true,
        shareToken: true,
      },
    });

    return NextResponse.json({
      success: true,
      isPublic: updatedBrief.isPublic,
      shareToken: updatedBrief.shareToken,
      shareUrl: updatedBrief.isPublic && updatedBrief.shareToken
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${updatedBrief.shareToken}`
        : null,
    });
  } catch (error) {
    console.error("Error toggling brief sharing:", error);
    return NextResponse.json(
      { error: "Failed to update sharing status" },
      { status: 500 }
    );
  }
}
