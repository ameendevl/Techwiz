import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateChatResponse } from "@/lib/chat/assistant";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const message = body.message?.trim();
    const channel = body.channel || "ai";

    if (!message) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message exceeds maximum limit of 2,000 characters." },
        { status: 400 }
      );
    }

    const userId = session?.user?.id || null;
    const userName = session?.user?.name || "Guest";
    const userRole = session?.user?.role || "GUEST";

    // Retrieve recent conversation history from database
    const pastMessages = userId
      ? await db.chatMessage.findMany({
          where: { userId, channel },
          orderBy: { createdAt: "desc" },
          take: 6,
        })
      : [];

    const history = pastMessages.reverse().map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Save user message to database
    const userMessageRecord = await db.chatMessage.create({
      data: {
        userId,
        role: "user",
        content: message,
        channel,
      },
    });

    // Generate assistant response
    const assistantResult = await generateChatResponse(message, history, {
      userId: userId ?? undefined,
      userName,
      userRole,
      channel,
    });

    // Save assistant response to database
    const assistantMessageRecord = await db.chatMessage.create({
      data: {
        userId,
        role: "assistant",
        content: assistantResult.content,
        channel,
        metadata: {
          provider: assistantResult.provider,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: assistantMessageRecord.id,
        role: "assistant",
        content: assistantResult.content,
        createdAt: assistantMessageRecord.createdAt,
        provider: assistantResult.provider,
        suggestions: assistantResult.suggestions,
      },
      userMessageId: userMessageRecord.id,
    });
  } catch (error) {
    console.error("[Chat API Error]", error);
    return NextResponse.json(
      { error: "Failed to generate chat response. Please try again." },
      { status: 500 }
    );
  }
}
