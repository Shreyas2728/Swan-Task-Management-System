import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth";
import { createTaskSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assigneeId = searchParams.get("assigneeId");
    const sortBy = searchParams.get("sortBy") || "order";
    const sortOrder = (searchParams.get("sortOrder") || "asc").toLowerCase() as "asc" | "desc";

    // Build Prisma where filter
    const where: any = {};

    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    if (assigneeId && assigneeId !== "ALL") {
      if (assigneeId === "UNASSIGNED") {
        where.assigneeId = null;
      } else {
        where.assigneeId = assigneeId;
      }
    }

    // Build orderBy
    let orderBy: any = [];
    if (sortBy === "dueDate") {
      orderBy = [{ dueDate: sortOrder }, { createdAt: "desc" }];
    } else if (sortBy === "priority") {
      orderBy = [{ priority: sortOrder }, { createdAt: "desc" }];
    } else if (sortBy === "title") {
      orderBy = [{ title: sortOrder }];
    } else if (sortBy === "createdAt") {
      orderBy = [{ createdAt: sortOrder }];
    } else {
      // Default to Kanban order then createdAt
      orderBy = [{ order: "asc" }, { createdAt: "desc" }];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            activityLogs: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("GET Tasks Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const validatedData = createTaskSchema.safeParse(body);

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

    const { title, description, status, priority, dueDate, assigneeId } = validatedData.data;

    // Get current max order in column for consistent drag-and-drop
    const maxOrderTask = await prisma.task.findFirst({
      where: { status },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (maxOrderTask?.order ?? -1) + 1;

    // Create task with activity log
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        creatorId: session.id,
        order: nextOrder,
        activityLogs: {
          create: {
            action: "CREATED",
            details: `Task created by ${session.name}`,
            userId: session.id,
          },
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            activityLogs: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Task Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while creating task" },
      { status: 500 }
    );
  }
}
