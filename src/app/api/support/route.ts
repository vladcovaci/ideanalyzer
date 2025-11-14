import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { sendSupportReplyEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, subject, priority, message } = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In a production app, you would:
    // 1. Store the support ticket in your database
    // 2. Send notification to support team (e.g., via Slack, email, or ticketing system)
    // 3. Send confirmation email to user

    // For now, we'll just send a confirmation email to the user
    await sendSupportReplyEmail(email, name, subject);

    // TODO: Send notification to support team
    // You could send an email to your support email address:
    /*
    await resend.emails.send({
      from: emailFrom,
      to: process.env.SUPPORT_EMAIL || "support@yourdomain.com",
      subject: `[${priority.toUpperCase()}] New Support Request: ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
    */

    // Log the support request for now
    console.log("Support request received:", {
      name,
      email,
      subject,
      priority,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully",
    });
  } catch (error) {
    console.error("Support request error:", error);
    return NextResponse.json(
      { error: "Failed to submit support request" },
      { status: 500 }
    );
  }
}
