import { NextRequest, NextResponse } from "next/server";
import { Langfuse } from "langfuse";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { traceId, value, comment } = body;

    if (!traceId) {
      return NextResponse.json(
        { error: "traceId is required" },
        { status: 400 }
      );
    }

    if (value !== "good" && value !== "bad") {
      return NextResponse.json(
        { error: "value must be 'good' or 'bad'" },
        { status: 400 }
      );
    }

    // Initialize Langfuse client
    const langfuse = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL || "http://langfuse-web:3000",
    });

    // Use only traceId for scoring with categorical value
    await langfuse.score({
      traceId: traceId,
      name: "user-feedback",
      value: value,
      dataType: "CATEGORICAL",
      comment: comment || undefined,
    });

    // Ensure all events are flushed
    await langfuse.flushAsync();

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
