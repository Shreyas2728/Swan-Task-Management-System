"use client";

import React, { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types";
import {
  Plus,
  MessageSquare,
  History,
  GripVertical,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";
import { getDueDateStatus, PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/utils";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onOpenNewTaskWithStatus: (status: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onSelectTask,
  onOpenNewTaskWithStatus,
}: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Columns definition
  const columns: { status: TaskStatus; title: string; icon: any; colorClass: string; bgClass: string }[] = [
    {
      status: "TODO",
      title: "To Do",
      icon: ListTodo,
      colorClass: "border-slate-400 text-slate-700",
      bgClass: "bg-slate-50/60",
    },
    {
      status: "IN_PROGRESS",
      title: "In Progress",
      icon: Clock,
      colorClass: "border-indigo-500 text-indigo-700",
      bgClass: "bg-indigo-50/40",
    },
    {
      status: "COMPLETED",
      title: "Completed",
      icon: CheckCircle2,
      colorClass: "border-emerald-500 text-emerald-700",
      bgClass: "bg-emerald-50/40",
    },
  ];

  // Filtering tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getTasksForColumn = (status: TaskStatus) => {
    return filteredTasks.filter((t) => t.status === status);
  };

  // Drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    setDraggedTaskId(null);

    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetStatus) {
        await onTaskStatusChange(taskId, targetStatus);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header & Quick Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kanban Board</h1>
          <p className="text-sm text-slate-500 mt-1">
            Drag and drop tasks between workflow stages to instantly update statuses.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3 Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map((col) => {
          const colTasks = getTasksForColumn(col.status);
          const isDropActive = activeDropColumn === col.status;
          const ColIcon = col.icon;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`rounded-2xl border transition-all duration-200 p-4 min-h-[580px] flex flex-col ${
                col.bgClass
              } ${
                isDropActive
                  ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50"
                  : "border-slate-200"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <ColIcon className={`w-4 h-4 ${col.colorClass}`} />
                  <h2 className="text-sm font-bold text-slate-800">{col.title}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onOpenNewTaskWithStatus(col.status)}
                  title={`Add new task to ${col.title}`}
                  className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task Cards Stack */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.map((task) => {
                  const dueStatus = getDueDateStatus(task.dueDate, task.status);
                  const priorityConfig = PRIORITY_CONFIG[task.priority];
                  const isBeingDragged = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onClick={() => onSelectTask(task)}
                      className={`group bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing relative select-none ${
                        isBeingDragged ? "opacity-40 scale-95 border-dashed border-blue-400" : ""
                      }`}
                    >
                      {/* Top Meta: Priority & Drag Handle */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${priorityConfig.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotClass}`} />
                          {priorityConfig.label}
                        </span>

                        <span className="text-slate-300 group-hover:text-slate-400 transition">
                          <GripVertical className="w-4 h-4" />
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-600 transition">
                        {task.title}
                      </h3>

                      {/* Description Snippet if available */}
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Due Date Indicator */}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {task.dueDate ? (
                          <div
                            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md ${dueStatus.className}`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{dueStatus.label}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No deadline</span>
                        )}

                        {/* Assignee Avatar */}
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.name}`}>
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
                            <span className="text-[11px] font-medium text-slate-600 hidden sm:inline truncate max-w-[80px]">
                              {task.assignee.name.split(" ")[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                        )}
                      </div>

                      {/* Card Footer: Comments & Activity Counts */}
                      {task._count && (task._count.comments > 0 || task._count.activityLogs > 0) && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-3 text-slate-400 text-[11px]">
                          {task._count.comments > 0 && (
                            <span className="flex items-center gap-1 hover:text-slate-600">
                              <MessageSquare className="w-3 h-3" />
                              {task._count.comments}
                            </span>
                          )}
                          {task._count.activityLogs > 0 && (
                            <span className="flex items-center gap-1 hover:text-slate-600">
                              <History className="w-3 h-3" />
                              {task._count.activityLogs} updates
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Empty State */}
                {colTasks.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200/80 rounded-xl flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                    <p>No tasks in this column</p>
                    <button
                      onClick={() => onOpenNewTaskWithStatus(col.status)}
                      className="text-blue-600 hover:underline font-medium mt-1 text-xs"
                    >
                      + Add a task
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
