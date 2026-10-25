"use client";

import React from "react";
import { DashboardStats, Task } from "@/types";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  TrendingUp,
  Calendar,
  ArrowRight,
  User as UserIcon,
  Activity,
} from "lucide-react";
import { formatDateTime, getDueDateStatus, PRIORITY_CONFIG } from "@/lib/utils";

interface DashboardViewProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  onSelectTask: (task: Task) => void;
  onNavigateToBoard: () => void;
}

export function DashboardView({
  stats,
  isLoading,
  onSelectTask,
  onNavigateToBoard,
}: DashboardViewProps) {
  if (isLoading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-xl"></div>
          <div className="h-72 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const {
    totalTasks,
    pendingTasks,
    completedTasks,
    overdueTasks,
    completionRate,
    statusBreakdown,
    priorityBreakdown,
    recentActivity,
    upcomingTasks,
  } = stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of team velocity, task distribution, and upcoming deadlines.
          </p>
        </div>
        <button
          onClick={onNavigateToBoard}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition active:scale-95 self-start"
        >
          <span>Open Kanban Board</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Overdue Alert Banner if any */}
      {overdueTasks > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-rose-900">
              Attention Required: {overdueTasks} task{overdueTasks > 1 ? "s are" : " is"} overdue!
            </span>
            <p className="text-rose-700 mt-0.5">
              Review overdue items to update schedules or reallocate team workload.
            </p>
          </div>
        </div>
      )}

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalTasks}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Active Workspace
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</p>
            <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{pendingTasks}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> In Progress & To Do
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{completedTasks}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {completionRate}% Completed
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${
            overdueTasks > 0
              ? "bg-rose-50/50 border-rose-200"
              : "bg-white border-slate-200"
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Tasks</p>
            <h3
              className={`text-3xl font-extrabold mt-1 ${
                overdueTasks > 0 ? "text-rose-600" : "text-slate-800"
              }`}
            >
              {overdueTasks}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <AlertTriangle className={`w-3.5 h-3.5 ${overdueTasks > 0 ? "text-rose-500" : "text-slate-400"}`} />
              Past Due Date
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              overdueTasks > 0
                ? "bg-rose-100 text-rose-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Task Status Distribution</h2>
              <p className="text-xs text-slate-500">Breakdown of tasks across workflow stages</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {totalTasks} Total
            </span>
          </div>

          {/* Multi-segment Progress Bar Chart */}
          <div className="mt-6">
            <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {statusBreakdown.map((item) => (
                <div
                  key={item.status}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.label}: ${item.count} (${item.percentage}%)`}
                  className="transition-all duration-500 hover:opacity-90 relative"
                />
              ))}
            </div>

            {/* Status Legend Grid */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
              {statusBreakdown.map((item) => (
                <div key={item.status} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium text-slate-600 truncate">{item.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1 pl-5">
                    <span className="text-xl font-bold text-slate-900">{item.count}</span>
                    <span className="text-xs text-slate-400">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Priority Level Breakdown</h2>
              <p className="text-xs text-slate-500">Task volume classified by urgency</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Workload Analysis
            </span>
          </div>

          <div className="space-y-4 mt-6">
            {priorityBreakdown.map((item) => {
              const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.priority} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                    <span className="text-slate-500 font-medium">
                      <span className="font-bold text-slate-800">{item.count}</span> ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Deadlines & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Upcoming Deadlines</h2>
            </div>
            <span className="text-xs text-slate-400">Next 5 Due Tasks</span>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingTasks && upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => {
                const dueStatus = getDueDateStatus(task.dueDate, task.status);
                const priorityConfig = PRIORITY_CONFIG[task.priority];
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-slate-50 rounded-xl cursor-pointer transition"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate hover:text-blue-600">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${priorityConfig.badgeClass}`}>
                          {priorityConfig.label}
                        </span>
                        {task.assignee && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <UserIcon className="w-3 h-3 text-slate-400" />
                            {task.assignee.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-lg shrink-0 ${dueStatus.className}`}>
                      {dueStatus.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                No upcoming deadlines on schedule.
              </div>
            )}
          </div>
        </div>

        {/* Chronological Team Activity History */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Team Activity</h2>
            </div>
            <span className="text-xs text-slate-400">Live Audit Trail</span>
          </div>

          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs py-1.5">
                  <img
                    src={log.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.user.name)}`}
                    alt={log.user.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800">
                      <span className="font-semibold">{log.user.name}</span>{" "}
                      <span className="text-slate-600">{log.details}</span>
                    </p>
                    {log.task && (
                      <p className="text-slate-500 font-medium truncate mt-0.5">
                        Task: <span className="text-slate-700 italic">{log.task.title}</span>
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
