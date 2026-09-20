import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || "ai";

    if (!userId) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await db.chatMessage.findMany({
      where: { userId, channel },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
        metadata: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[Chat History GET Error]", error);
    return NextResponse.json(
      { error: "Failed to load chat history." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || "ai";

    if (!userId) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const deleteResult = await db.chatMessage.deleteMany({
      where: { userId, channel },
    });

    return NextResponse.json({
      success: true,
      count: deleteResult.count,
    });
  } catch (error) {
    console.error("[Chat History DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to clear chat history." },
      { status: 500 }
    );
  }
}
