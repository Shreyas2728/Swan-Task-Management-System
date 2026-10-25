"use client";

import React, { useState, useMemo } from "react";
import { Task, TaskPriority, TaskStatus, User } from "@/types";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  Calendar,
  User as UserIcon,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ListTodo,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { formatDate, getDueDateStatus, PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface TaskListViewProps {
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onOpenNewTask: () => void;
}

export function TaskListView({
  tasks,
  users,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onTaskStatusChange,
  onOpenNewTask,
}: TaskListViewProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("dueDateAsc");
  const [isExporting, setIsExporting] = useState(false);

  // Filter and sort tasks
  const processedTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Search
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query));

        // Status
        const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

        // Priority
        const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

        // Assignee
        const matchesAssignee =
          assigneeFilter === "ALL" ||
          (assigneeFilter === "UNASSIGNED" ? !t.assigneeId : t.assigneeId === assigneeFilter);

        return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
      })
      .sort((a, b) => {
        if (sortBy === "dueDateAsc") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === "dueDateDesc") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (sortBy === "priorityHigh") {
          const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        if (sortBy === "priorityLow") {
          const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return weight[a.priority] - weight[b.priority];
        }
        if (sortBy === "titleAsc") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    assigneeFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setAssigneeFilter("ALL");
    setSortBy("dueDateAsc");
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (priorityFilter !== "ALL") params.append("priority", priorityFilter);

      const url = `/api/tasks/export/csv?${params.toString()}`;
      window.open(url, "_blank");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter by status and priority, sort by deadlines, and export reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* New Task Button */}
          <button
            onClick={onOpenNewTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="dueDateAsc">Due Date: Earliest First</option>
              <option value="dueDateDesc">Due Date: Latest First</option>
              <option value="priorityHigh">Priority: High to Low</option>
              <option value="priorityLow">Priority: Low to High</option>
              <option value="newest">Recently Created</option>
              <option value="titleAsc">Title: A to Z</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Clear Filter */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing <span className="font-bold text-slate-800">{processedTasks.length}</span> of{" "}
              {tasks.length} total tasks
            </span>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Desktop Tasks Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-36">Status</th>
              <th className="py-3.5 px-4">Task Details</th>
              <th className="py-3.5 px-4 w-32">Priority</th>
              <th className="py-3.5 px-4 w-40">Due Date</th>
              <th className="py-3.5 px-4 w-44">Assignee</th>
              <th className="py-3.5 px-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {processedTasks.length > 0 ? (
              processedTasks.map((task) => {
                const dueStatus = getDueDateStatus(task.dueDate, task.status);
                const priorityConfig = PRIORITY_CONFIG[task.priority];
                const canDelete = user?.role === "ADMIN" || user?.id === task.creatorId;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Status Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => onTaskStatusChange(task.id, e.target.value as TaskStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer transition ${
                          STATUS_CONFIG[task.status].badgeClass
                        }`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>

                    {/* Task Title & Description */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onSelectTask(task)}
                        className="cursor-pointer"
                      >
                        <p className="font-semibold text-slate-800 hover:text-blue-600 transition leading-snug">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${priorityConfig.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotClass}`} />
                        {priorityConfig.label}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg ${dueStatus.className}`}>
                        <Calendar className="w-3 h-3" />
                        {dueStatus.label}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-4">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              task.assignee.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                task.assignee.name
                              )}`
                            }
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="text-xs font-medium text-slate-700 truncate">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditTask(task)}
                          title="Edit Task"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            title="Delete Task"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  <p className="font-medium">No tasks found matching your filter criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Reset filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card-Based List */}
      <div className="md:hidden space-y-3">
        {processedTasks.length > 0 ? (
          processedTasks.map((task) => {
            const dueStatus = getDueDateStatus(task.dueDate, task.status);
            const priorityConfig = PRIORITY_CONFIG[task.priority];
            const canDelete = user?.role === "ADMIN" || user?.id === task.creatorId;

            return (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div onClick={() => onSelectTask(task)} className="flex-1 cursor-pointer">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border mb-1.5 ${priorityConfig.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotClass}`} />
                      {priorityConfig.label}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{task.title}</h3>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) => onTaskStatusChange(task.id, e.target.value as TaskStatus)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      STATUS_CONFIG[task.status].badgeClass
                    }`}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className={`px-2 py-0.5 rounded text-[11px] ${dueStatus.className}`}>
                    {dueStatus.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
            No matching tasks found.
          </div>
        )}
      </div>
    </div>
  );
}
