import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

const isValidObjectId = (id: string): boolean => {
  return /^[a-f\d]{24}$/i.test(id);
};

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid brief ID" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brief = await prisma.brief.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!brief) {
    return NextResponse.json({ error: "Brief not found." }, { status: 404 });
  }

  await prisma.brief.delete({
    where: { id: brief.id },
  });

  return NextResponse.json({ success: true });
}
