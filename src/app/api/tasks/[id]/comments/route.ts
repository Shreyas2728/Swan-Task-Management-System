import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id: taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = createCommentSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { content } = validatedData.data;

    // Create comment and add activity log in a transaction
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          content,
          taskId,
          userId: session.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
      }),
      prisma.activityLog.create({
        data: {
          action: "COMMENT_ADDED",
          details: `Commented: "${content.length > 40 ? content.substring(0, 40) + "..." : content}"`,
          taskId,
          userId: session.id,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Comment Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to post comment" },
      { status: 500 }
    );
  }
}
