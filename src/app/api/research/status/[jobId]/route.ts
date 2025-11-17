import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkDeepResearchStatus } from "@/lib/research/deep-research";

// Fast endpoint - just checks status
export const maxDuration = 10;
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  // In Next.js 15, params is a Promise
  const { jobId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!jobId) {
    return NextResponse.json(
      { error: "Job ID is required" },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  // Find the research job in database
  const researchJob = await prisma.researchJob.findFirst({
    where: { id: jobId, userId },
  });

  if (!researchJob) {
    return NextResponse.json(
      { error: "Research job not found" },
      { status: 404 }
    );
  }

  // If already completed or failed, return stored result
  if (researchJob.status === "completed") {
    return NextResponse.json({
      status: "completed",
      isComplete: true,
      result: researchJob.result,
      proofSignals: researchJob.proofSignals,
      ideaId: researchJob.ideaId,
    });
  }

  if (researchJob.status === "failed") {
    return NextResponse.json({
      status: "failed",
      isComplete: true,
      error: researchJob.error || "Research failed",
    });
  }

  // Job is still processing - check OpenAI status
  if (!researchJob.openaiJobId) {
    return NextResponse.json({
      status: "pending",
      isComplete: false,
      message: "Job queued, waiting to start",
    });
  }

  try {
    // Check status from OpenAI
    const deepResearchStatus = await checkDeepResearchStatus(
      researchJob.openaiJobId
    );

    // If completed, update database and create Brief
    if (deepResearchStatus.isComplete) {
      if (deepResearchStatus.status === "completed") {
        // Update research job with results
        const updatedJob = await prisma.researchJob.update({
          where: { id: jobId },
          data: {
            status: "completed",
            proofSignals: deepResearchStatus.proofSignals,
            tokenUsage: deepResearchStatus.usage || null,
            completedAt: new Date(),
          },
        });

        // Create or update the Brief with proof signals
        let briefId = null;
        if (researchJob.ideaId) {
          try {
            // Get existing partial brief or create new one
            const existingBrief = await prisma.brief.findFirst({
              where: {
                ideaId: researchJob.ideaId,
                userId,
                status: "draft",
              },
            });

            if (existingBrief) {
              // Update existing brief with proof signals
              const updatedContent = {
                ...(existingBrief.content as object),
                proofSignals: deepResearchStatus.proofSignals,
                proofSignalSummary: deepResearchStatus.summary,
                proofSignalStage: deepResearchStatus.marketStage,
                proofSignalDisclaimer: deepResearchStatus.disclaimer,
              };

              const brief = await prisma.brief.update({
                where: { id: existingBrief.id },
                data: {
                  content: updatedContent,
                  status: "completed",
                  completedAt: new Date(),
                },
              });
              briefId = brief.id;
            }

            // Update idea status
            await prisma.idea.update({
              where: { id: researchJob.ideaId },
              data: { status: "completed" },
            });
          } catch (error) {
            console.error("[Status API] Failed to update brief:", error);
          }
        }

        return NextResponse.json({
          status: "completed",
          isComplete: true,
          proofSignals: deepResearchStatus.proofSignals,
          summary: deepResearchStatus.summary,
          marketStage: deepResearchStatus.marketStage,
          disclaimer: deepResearchStatus.disclaimer,
          usage: deepResearchStatus.usage,
          briefId,
          ideaId: researchJob.ideaId,
        });
      } else {
        // Failed
        await prisma.researchJob.update({
          where: { id: jobId },
          data: {
            status: "failed",
            error: deepResearchStatus.summary || "Research failed",
            completedAt: new Date(),
          },
        });

        // Update idea status to failed
        if (researchJob.ideaId) {
          await prisma.idea.updateMany({
            where: { id: researchJob.ideaId, userId },
            data: { status: "completed_with_warnings" },
          });
        }

        return NextResponse.json({
          status: "failed",
          isComplete: true,
          error: deepResearchStatus.summary || "Research failed",
        });
      }
    }

    // Still processing
    return NextResponse.json({
      status: deepResearchStatus.status,
      isComplete: false,
      message: "Deep research in progress...",
    });
  } catch (error) {
    console.error("[Status API] Error checking job status:", error);
    return NextResponse.json(
      {
        error: "Failed to check job status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
