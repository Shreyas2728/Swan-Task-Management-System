import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
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
        comments: {
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
          orderBy: { createdAt: "asc" },
        },
        activityLogs: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("GET Task by ID Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch task details" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = updateTaskSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updates = validatedData.data;
    const dataToUpdate: any = {};
    const auditLogs: { action: string; details: string; userId: string }[] = [];

    if (updates.title !== undefined) {
      dataToUpdate.title = updates.title;
      if (updates.title !== existingTask.title) {
        auditLogs.push({
          action: "TITLE_UPDATED",
          details: `Title updated to "${updates.title}" by ${session.name}`,
          userId: session.id,
        });
      }
    }

    if (updates.description !== undefined) {
      dataToUpdate.description = updates.description || null;
    }

    if (updates.status !== undefined && updates.status !== existingTask.status) {
      dataToUpdate.status = updates.status;
      auditLogs.push({
        action: "STATUS_CHANGED",
        details: `Status changed from ${existingTask.status.replace("_", " ")} to ${updates.status.replace("_", " ")} by ${session.name}`,
        userId: session.id,
      });
    }

    if (updates.priority !== undefined && updates.priority !== existingTask.priority) {
      dataToUpdate.priority = updates.priority;
      auditLogs.push({
        action: "PRIORITY_CHANGED",
        details: `Priority updated from ${existingTask.priority} to ${updates.priority} by ${session.name}`,
        userId: session.id,
      });
    }

    if (updates.dueDate !== undefined) {
      const newDueDate = updates.dueDate ? new Date(updates.dueDate) : null;
      dataToUpdate.dueDate = newDueDate;
      auditLogs.push({
        action: "DUE_DATE_CHANGED",
        details: newDueDate
          ? `Due date set to ${newDueDate.toLocaleDateString()} by ${session.name}`
          : `Due date cleared by ${session.name}`,
        userId: session.id,
      });
    }

    if (updates.assigneeId !== undefined && updates.assigneeId !== existingTask.assigneeId) {
      dataToUpdate.assigneeId = updates.assigneeId || null;
      if (updates.assigneeId) {
        const newAssignee = await prisma.user.findUnique({
          where: { id: updates.assigneeId },
          select: { name: true },
        });
        auditLogs.push({
          action: "REASSIGNED",
          details: `Reassigned to ${newAssignee?.name || "team member"} by ${session.name}`,
          userId: session.id,
        });
      } else {
        auditLogs.push({
          action: "UNASSIGNED",
          details: `Unassigned by ${session.name}`,
          userId: session.id,
        });
      }
    }

    if (updates.order !== undefined) {
      dataToUpdate.order = updates.order;
    }

    // Perform database update with activity logs transaction
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...dataToUpdate,
        activityLogs: auditLogs.length > 0 ? { create: auditLogs } : undefined,
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

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("PATCH Task Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        creatorId: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Role-Based Access Control:
    // Only Admin OR the task creator can delete
    if (session.role !== "ADMIN" && session.id !== task.creatorId) {
      return NextResponse.json(
        {
          success: false,
          error: "Permission denied. Only Administrators or the task creator can delete this task.",
        },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Task "${task.title}" deleted successfully`,
    });
  } catch (error) {
    console.error("DELETE Task Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
