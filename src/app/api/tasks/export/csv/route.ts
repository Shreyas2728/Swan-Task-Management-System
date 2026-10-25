import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { name: true, email: true } },
        creator: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Helper to escape CSV cell
    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""').replace(/\r?\n/g, " ");
      return `"${clean}"`;
    };

    const headers = [
      "Task ID",
      "Title",
      "Description",
      "Status",
      "Priority",
      "Due Date",
      "Assignee",
      "Assignee Email",
      "Creator",
      "Created At",
    ];

    const rows = tasks.map((t) => [
      escapeCsv(t.id),
      escapeCsv(t.title),
      escapeCsv(t.description || ""),
      escapeCsv(t.status),
      escapeCsv(t.priority),
      escapeCsv(t.dueDate ? t.dueDate.toISOString().split("T")[0] : "None"),
      escapeCsv(t.assignee?.name || "Unassigned"),
      escapeCsv(t.assignee?.email || ""),
      escapeCsv(t.creator?.name || "System"),
      escapeCsv(t.createdAt.toISOString()),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `swan_tasks_export_${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export CSV Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export tasks as CSV" },
      { status: 500 }
    );
  }
}
