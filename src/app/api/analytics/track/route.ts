import { NextResponse } from "next/server";
import { z } from "zod";
import { trackServerEvent } from "@/lib/analytics/server";

const bodySchema = z.object({
  event: z.string().min(1),
  distinctId: z.string().optional(),
  properties: z.record(z.any()).optional(),
});

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "false") {
    return NextResponse.json({ success: true });
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await trackServerEvent({
    event: payload.event,
    distinctId: payload.distinctId,
    properties: payload.properties,
  });

  return NextResponse.json({ success: true });
}
