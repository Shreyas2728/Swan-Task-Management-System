import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return unauthorizedResponse();
    }

    const now = new Date();

    // Run parallel queries for maximum performance
    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      allIncompleteTasks,
      recentActivity,
      upcomingTasks,
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: "TODO" } }),
      prisma.task.count({ where: { status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { status: "COMPLETED" } }),
      prisma.task.count({ where: { priority: "HIGH" } }),
      prisma.task.count({ where: { priority: "MEDIUM" } }),
      prisma.task.count({ where: { priority: "LOW" } }),
      prisma.task.findMany({
        where: {
          status: { not: "COMPLETED" },
          dueDate: { not: null },
        },
        select: { id: true, dueDate: true },
      }),
      prisma.activityLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      prisma.task.findMany({
        where: {
          status: { not: "COMPLETED" },
          dueDate: { not: null },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
        include: {
          assignee: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
    ]);

    // Calculate overdue tasks
    const overdueTasks = allIncompleteTasks.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() < now.getTime();
    }).length;

    const pendingTasks = todoTasks + inProgressTasks;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const statusBreakdown = [
      {
        status: "TODO",
        label: "To Do",
        count: todoTasks,
        percentage: totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0,
        color: "#64748b", // slate-500
      },
      {
        status: "IN_PROGRESS",
        label: "In Progress",
        count: inProgressTasks,
        percentage: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
        color: "#6366f1", // indigo-500
      },
      {
        status: "COMPLETED",
        label: "Completed",
        count: completedTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        color: "#10b981", // emerald-500
      },
    ];

    const priorityBreakdown = [
      {
        priority: "HIGH",
        label: "High Priority",
        count: highPriorityTasks,
        color: "#f43f5e", // rose-500
      },
      {
        priority: "MEDIUM",
        label: "Medium Priority",
        count: mediumPriorityTasks,
        color: "#3b82f6", // blue-500
      },
      {
        priority: "LOW",
        label: "Low Priority",
        count: lowPriorityTasks,
        color: "#10b981", // emerald-500
      },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
        completionRate,
        statusBreakdown,
        priorityBreakdown,
        recentActivity,
        upcomingTasks,
      },
    });
  } catch (error) {
    console.error("GET Dashboard Stats Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
