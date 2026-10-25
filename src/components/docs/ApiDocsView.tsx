"use client";

import React, { useState } from "react";
import { FileCode, Shield, Check, Copy } from "lucide-react";

interface ApiEndpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  title: string;
  description: string;
  authRequired: boolean;
  roleRequired?: string;
  requestBody?: string;
  queryParams?: string[];
  responseSample: string;
}

export function ApiDocsView() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const endpoints: ApiEndpoint[] = [
    {
      method: "POST",
      path: "/api/auth/register",
      title: "Register New User",
      description: "Creates a new user profile with hashed password and returns session token.",
      authRequired: false,
      requestBody: JSON.stringify(
        {
          name: "Alex Rivera",
          email: "alex@swan.com",
          password: "password123",
          role: "USER",
        },
        null,
        2
      ),
      responseSample: JSON.stringify(
        {
          success: true,
          message: "Account created successfully",
          user: { id: "uuid", name: "Alex Rivera", email: "alex@swan.com", role: "USER" },
          token: "eyJhbGciOi...",
        },
        null,
        2
      ),
    },
    {
      method: "POST",
      path: "/api/auth/login",
      title: "User Authentication / Login",
      description: "Authenticates email and password, returning JWT token and setting HTTP-only cookie.",
      authRequired: false,
      requestBody: JSON.stringify(
        {
          email: "admin@swan.com",
          password: "password123",
        },
        null,
        2
      ),
      responseSample: JSON.stringify(
        {
          success: true,
          message: "Login successful",
          user: { id: "uuid", name: "Alex Rivera", email: "admin@swan.com", role: "ADMIN" },
          token: "eyJhbGciOi...",
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/auth/me",
      title: "Get Current Authenticated Session",
      description: "Returns currently authenticated user by checking HTTP-only cookie or Bearer token header.",
      authRequired: true,
      responseSample: JSON.stringify(
        {
          success: true,
          user: { id: "uuid", name: "Alex Rivera", email: "admin@swan.com", role: "ADMIN" },
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/tasks",
      title: "List & Filter Tasks",
      description: "Fetches tasks with full filtering by title, status, priority, and assignee, plus sorting.",
      authRequired: true,
      queryParams: [
        "search: string (case-insensitive search)",
        "status: TODO | IN_PROGRESS | COMPLETED | ALL",
        "priority: LOW | MEDIUM | HIGH | ALL",
        "assigneeId: string | UNASSIGNED | ALL",
        "sortBy: dueDate | priority | title | createdAt",
        "sortOrder: asc | desc",
      ],
      responseSample: JSON.stringify(
        {
          success: true,
          count: 7,
          tasks: [
            {
              id: "task-uuid",
              title: "Security Audit & Token Expiration Patch",
              status: "TODO",
              priority: "HIGH",
              dueDate: "2026-10-22T00:00:00.000Z",
              assignee: { id: "u-1", name: "David Kim" },
            },
          ],
        },
        null,
        2
      ),
    },
    {
      method: "POST",
      path: "/api/tasks",
      title: "Create Task",
      description: "Creates a task with title, priority, status, due date, and records creation in audit activity log.",
      authRequired: true,
      requestBody: JSON.stringify(
        {
          title: "Implement Real-time WebSocket Notifications",
          description: "Add live push notifications when tasks are reassigned or commented on.",
          status: "TODO",
          priority: "MEDIUM",
          dueDate: "2026-10-30",
          assigneeId: "user-uuid",
        },
        null,
        2
      ),
      responseSample: JSON.stringify(
        {
          success: true,
          message: "Task created successfully",
          task: { id: "task-uuid", title: "Implement Real-time...", status: "TODO" },
        },
        null,
        2
      ),
    },
    {
      method: "PATCH",
      path: "/api/tasks/:id",
      title: "Update Task",
      description: "Modifies task attributes (status, priority, due date, assignee) and logs audit events.",
      authRequired: true,
      requestBody: JSON.stringify(
        {
          status: "IN_PROGRESS",
          priority: "HIGH",
        },
        null,
        2
      ),
      responseSample: JSON.stringify(
        {
          success: true,
          message: "Task updated successfully",
          task: { id: "task-uuid", status: "IN_PROGRESS", priority: "HIGH" },
        },
        null,
        2
      ),
    },
    {
      method: "DELETE",
      path: "/api/tasks/:id",
      title: "Delete Task (RBAC Protected)",
      description: "Enforces Role-Based Access Control: only Administrators or the Task Creator can delete.",
      authRequired: true,
      roleRequired: "ADMIN or Creator",
      responseSample: JSON.stringify(
        {
          success: true,
          message: "Task deleted successfully",
        },
        null,
        2
      ),
    },
    {
      method: "POST",
      path: "/api/tasks/:id/comments",
      title: "Add Task Comment",
      description: "Posts a comment on a task and records timestamped entry in the task's audit history.",
      authRequired: true,
      requestBody: JSON.stringify(
        {
          content: "I have pushed the latest revision to staging for review.",
        },
        null,
        2
      ),
      responseSample: JSON.stringify(
        {
          success: true,
          message: "Comment added successfully",
          comment: { id: "c-uuid", content: "I have pushed...", user: { name: "Sarah Chen" } },
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/dashboard/stats",
      title: "Get Dashboard Statistics & Visualizations",
      description: "Calculates total, pending, completed, overdue metrics, status and priority distribution charts.",
      authRequired: true,
      responseSample: JSON.stringify(
        {
          success: true,
          stats: {
            totalTasks: 7,
            pendingTasks: 5,
            completedTasks: 2,
            overdueTasks: 1,
            completionRate: 29,
          },
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/tasks/export/csv",
      title: "Export Tasks as CSV",
      description: "Generates formatted CSV download containing all filtered tasks, assignees, and dates.",
      authRequired: true,
      responseSample: "Task ID,Title,Description,Status,Priority,Due Date,Assignee...",
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "POST":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "PATCH":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "DELETE":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileCode className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            REST API Documentation & Endpoints
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          All endpoints conform to RESTful design principles with standardized JSON responses and HTTP status codes.
        </p>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-black tracking-wider px-2.5 py-1 rounded-md border ${getMethodBadge(
                    ep.method
                  )}`}
                >
                  {ep.method}
                </span>
                <code className="text-sm font-bold text-slate-800">{ep.path}</code>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {ep.authRequired && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                    <Shield className="w-3 h-3 text-slate-500" /> Auth Required
                  </span>
                )}
                {ep.roleRequired && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    {ep.roleRequired}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-slate-800">{ep.title}</p>
                <p className="text-slate-500 mt-0.5">{ep.description}</p>
              </div>

              {ep.queryParams && (
                <div>
                  <p className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1">
                    Query Parameters
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {ep.queryParams.map((q, qIdx) => (
                      <li key={qIdx} className="font-mono text-[11px]">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ep.requestBody && (
                <div>
                  <p className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1">
                    Request Payload (JSON)
                  </p>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {ep.requestBody}
                  </pre>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Response Sample (200 OK)
                  </p>
                  <button
                    onClick={() => handleCopy(ep.responseSample, idx)}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Sample</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {ep.responseSample}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
