import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Clean existing data
    await prisma.activityLog.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Alex Rivera",
        email: "admin@swan.com",
        password: hashedPassword,
        role: "ADMIN",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
    });

    const sarah = await prisma.user.create({
      data: {
        name: "Sarah Chen",
        email: "sarah@swan.com",
        password: hashedPassword,
        role: "USER",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      },
    });

    const david = await prisma.user.create({
      data: {
        name: "David Kim",
        email: "david@swan.com",
        password: hashedPassword,
        role: "USER",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
    });

    const priya = await prisma.user.create({
      data: {
        name: "Priya Sharma",
        email: "priya@swan.com",
        password: hashedPassword,
        role: "USER",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      },
    });

    const now = new Date();
    const past3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const in4Days = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    // Overdue task
    await prisma.task.create({
      data: {
        title: "Security Audit & Token Expiration Patch",
        description: "Review JWT session storage, ensure HTTP-only secure cookie enforcement, and implement token renewal grace period before production audit.",
        status: "TODO",
        priority: "HIGH",
        dueDate: past3Days,
        order: 0,
        creatorId: admin.id,
        assigneeId: david.id,
        comments: {
          create: [
            {
              content: "David, please prioritize this as the audit deadline was 3 days ago.",
              userId: admin.id,
            },
            {
              content: "Working on it today! Refresh token middleware is almost ready.",
              userId: david.id,
            },
          ],
        },
        activityLogs: {
          create: [
            {
              action: "CREATED",
              details: "Task created by Alex Rivera",
              userId: admin.id,
            },
            {
              action: "ASSIGNED",
              details: "Assigned to David Kim",
              userId: admin.id,
            },
            {
              action: "PRIORITY_CHANGED",
              details: "Priority elevated to HIGH",
              userId: admin.id,
            },
          ],
        },
      },
    });

    // In Progress 1
    await prisma.task.create({
      data: {
        title: "Design Responsive Kanban Board UI",
        description: "Implement interactive drag-and-drop columns for task status movement with optimistic UI updates and mobile responsive cards.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: in2Days,
        order: 0,
        creatorId: admin.id,
        assigneeId: sarah.id,
        comments: {
          create: [
            {
              content: "Completed column layout with drag feedback badges. Testing on mobile safari now.",
              userId: sarah.id,
            },
          ],
        },
        activityLogs: {
          create: [
            {
              action: "CREATED",
              details: "Task created by Alex Rivera",
              userId: admin.id,
            },
            {
              action: "STATUS_CHANGED",
              details: "Status moved from TODO to IN_PROGRESS by Sarah Chen",
              userId: sarah.id,
            },
          ],
        },
      },
    });

    // In Progress 2
    await prisma.task.create({
      data: {
        title: "Real-time Metrics Dashboard & Visualizations",
        description: "Create summary cards for total, pending, completed, and overdue tasks. Integrate visual charts for task distribution by status and priority.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: in4Days,
        order: 1,
        creatorId: sarah.id,
        assigneeId: priya.id,
        comments: {
          create: [
            {
              content: "Added donut chart for status breakdown and bar chart for priority analysis.",
              userId: priya.id,
            },
          ],
        },
        activityLogs: {
          create: [
            {
              action: "CREATED",
              details: "Task created by Sarah Chen",
              userId: sarah.id,
            },
            {
              action: "STATUS_CHANGED",
              details: "Status changed to IN_PROGRESS by Priya Sharma",
              userId: priya.id,
            },
          ],
        },
      },
    });

    // To Do 1
    await prisma.task.create({
      data: {
        title: "CSV Export & Reporting Endpoint",
        description: "Enable managers and admins to export filtered tasks into a downloadable CSV file including task title, description, priority, assignee, and dates.",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: in7Days,
        order: 1,
        creatorId: admin.id,
        assigneeId: david.id,
        activityLogs: {
          create: [
            {
              action: "CREATED",
              details: "Task created by Alex Rivera",
              userId: admin.id,
            },
          ],
        },
      },
    });

    // To Do 2
    await prisma.task.create({
      data: {
        title: "Write End-to-End API Documentation & README",
        description: "Document all REST API routes, query parameters, authentication headers, error codes, and deployment instructions for evaluators.",
        status: "TODO",
        priority: "LOW",
        dueDate: in10Days,
        order: 2,
        creatorId: sarah.id,
        assigneeId: priya.id,
        activityLogs: {
          create: [
            {
              action: "CREATED",
              details: "Task created by Sarah Chen",
              userId: sarah.id,
            },
          ],
        },
      },
    });

    // Completed 1
    await prisma.task.create({
      data: {
        title: "Prisma Database Schema & Relational Models",
        description: "Define User, Task, Comment, and ActivityLog models with proper foreign key relationships, cascade rules, and indexes.",
        status: "COMPLETED",
        priority: "HIGH",
        dueDate: in2Days,
        order: 0,
        creatorId: admin.id,
        assigneeId: david.id,
        comments: {
          create: [
            {
              content: "Schema verified and SQLite dev database created successfully.",
              userId: david.id,
            },
          ],
        },
        activityLogs: {
          create: [
            {
              action: "CREATED",
              details: "Task created by Alex Rivera",
              userId: admin.id,
            },
            {
              action: "STATUS_CHANGED",
              details: "Marked as COMPLETED by David Kim",
              userId: david.id,
            },
          ],
        },
      },
    });

    // Completed 2
    await prisma.task.create({
      data: {
        title: "JWT Authentication & Role-Based Middleware",
        description: "Implement secure registration, bcrypt password hashing, JWT generation, HTTP-only session cookie management, and Admin/User role verification.",
        status: "COMPLETED",
        priority: "MEDIUM",
        dueDate: in4Days,
        order: 1,
        creatorId: admin.id,
        assigneeId: sarah.id,
        comments: {
          create: [
            {
              content: "Auth routes tested and verified with both Admin and Member credentials.",
              userId: sarah.id,
            },
          ],
        },
        activityLogs: {
          create: [
            {
              action: "CREATED",
              details: "Task created by Alex Rivera",
              userId: admin.id,
            },
            {
              action: "STATUS_CHANGED",
              details: "Status updated to COMPLETED by Sarah Chen",
              userId: sarah.id,
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database re-seeded successfully with demo data",
    });
  } catch (error) {
    console.error("Seed API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
