"use client";

import React, { useState, useEffect } from "react";
import { Task, Comment, ActivityLog, TaskStatus } from "@/types";
import {
  X,
  Calendar,
  User as UserIcon,
  MessageSquare,
  History,
  Send,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { formatDateTime, getDueDateStatus, PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface TaskDetailsDrawerProps {
  task: Task | null;
  onClose: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onRefreshTask: () => void;
}

export function TaskDetailsDrawer({
  task,
  onClose,
  onEditTask,
  onDeleteTask,
  onTaskStatusChange,
  onRefreshTask,
}: TaskDetailsDrawerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch full details (comments and activity logs)
  const fetchTaskDetails = async (id: string) => {
    try {
      setIsLoadingDetails(true);
      const res = await fetch(`/api/tasks/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDetailedTask(data.task);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (task) {
      setDetailedTask(task);
      fetchTaskDetails(task.id);
    } else {
      setDetailedTask(null);
    }
  }, [task]);

  if (!task || !detailedTask) return null;

  const currentTask = detailedTask;
  const dueStatus = getDueDateStatus(currentTask.dueDate, currentTask.status);
  const priorityConfig = PRIORITY_CONFIG[currentTask.priority];
  const canDelete = user?.role === "ADMIN" || user?.id === currentTask.creatorId;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isPostingComment) return;

    try {
      setIsPostingComment(true);
      const res = await fetch(`/api/tasks/${currentTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.ok) {
        setNewComment("");
        await fetchTaskDetails(currentTask.id);
        onRefreshTask();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-fade-in border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Status Dropdown */}
            <select
              value={currentTask.status}
              onChange={async (e) => {
                const newStatus = e.target.value as TaskStatus;
                await onTaskStatusChange(currentTask.id, newStatus);
                await fetchTaskDetails(currentTask.id);
              }}
              className={`text-xs font-bold px-3 py-1 rounded-lg border focus:outline-none cursor-pointer transition ${
                STATUS_CONFIG[currentTask.status].badgeClass
              }`}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${priorityConfig.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotClass}`} />
              {priorityConfig.label} Priority
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditTask(currentTask)}
              title="Edit Task"
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {canDelete && (
              <button
                onClick={() => {
                  onDeleteTask(currentTask.id);
                  onClose();
                }}
                title="Delete Task"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug">
              {currentTask.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Created on {formatDateTime(currentTask.createdAt)}
            </p>
          </div>

          {/* Description */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {currentTask.description || "No description provided for this task."}
            </p>
          </div>

          {/* Meta Grid: Assignee, Due Date, Creator */}
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assignee
              </p>
              {currentTask.assignee ? (
                <div className="flex items-center gap-2 mt-1.5">
                  <img
                    src={
                      currentTask.assignee.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        currentTask.assignee.name
                      )}`
                    }
                    alt={currentTask.assignee.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{currentTask.assignee.name}</p>
                    <p className="text-[10px] text-slate-500">{currentTask.assignee.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">Unassigned</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Due Date
              </p>
              <div className="mt-1.5">
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${dueStatus.className}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  {dueStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs: Comments vs Activity Log */}
          <div>
            <div className="flex items-center border-b border-slate-200 gap-4 mb-4">
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition border-b-2 -mb-[2px] ${
                  activeTab === "comments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Comments ({currentTask.comments?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab("activity")}
                className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition border-b-2 -mb-[2px] ${
                  activeTab === "activity"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Audit Activity ({currentTask.activityLogs?.length || 0})</span>
              </button>
            </div>

            {/* Tab 1: Comments */}
            {activeTab === "comments" && (
              <div className="space-y-4">
                {/* Comments List */}
                <div className="space-y-3">
                  {currentTask.comments && currentTask.comments.length > 0 ? (
                    currentTask.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                comment.user.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  comment.user.name
                                )}`
                              }
                              alt={comment.user.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs font-bold text-slate-800">
                              {comment.user.name}
                            </span>
                            {comment.user.role === "ADMIN" && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1 rounded font-semibold">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pl-7">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-xs text-slate-400">
                      No comments yet. Start the conversation below!
                    </p>
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="pt-2">
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment or team update..."
                      rows={2}
                      className="w-full pl-3.5 pr-20 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isPostingComment || !newComment.trim()}
                      className="absolute right-2.5 bottom-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-40"
                    >
                      {isPostingComment ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Reply</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: Chronological Activity Log */}
            {activeTab === "activity" && (
              <div className="space-y-3">
                {currentTask.activityLogs && currentTask.activityLogs.length > 0 ? (
                  currentTask.activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <img
                        src={
                          log.user?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            log.user?.name || "User"
                          )}`
                        }
                        alt={log.user?.name || "User"}
                        className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800">
                          <span className="font-bold">{log.user?.name}</span>{" "}
                          <span className="text-slate-600">{log.details}</span>
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400">
                    No activity recorded for this task.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
