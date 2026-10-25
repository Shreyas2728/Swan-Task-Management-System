"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthView } from "@/components/auth/AuthView";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { ApiDocsView } from "@/components/docs/ApiDocsView";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskDetailsDrawer } from "@/components/tasks/TaskDetailsDrawer";
import { Task, DashboardStats, TaskStatus, User } from "@/types";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function MainContent() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "kanban" | "list" | "docs">("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultStatusForNewTask, setDefaultStatusForNewTask] = useState<TaskStatus>("TODO");

  // Toast notifications
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTasks(data.tasks);
        }
      }
    } catch (e) {
      console.error("Error fetching tasks:", e);
    }
  }, []);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }, []);

  // Fetch users for assignees
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        }
      }
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchTasks(), fetchStats(), fetchUsers()]);
    setIsLoading(false);
  }, [fetchTasks, fetchStats, fetchUsers]);

  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user, refreshAllData]);

  // Handle task status transition (e.g. via drag-and-drop or select)
  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // 1. Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // Rollback on failure
        fetchTasks();
        showToast("error", "Failed to update task status on server");
      } else {
        fetchStats();
        showToast("success", `Task moved to ${newStatus.replace("_", " ")}`);
      }
    } catch {
      fetchTasks();
      showToast("error", "Network error updating task status");
    }
  };

  // Handle Create or Update task
  const handleSaveTask = async (taskData: any): Promise<boolean> => {
    try {
      if (taskToEdit) {
        const res = await fetch(`/api/tasks/${taskToEdit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          showToast("error", data.error || "Failed to update task");
          return false;
        }
        showToast("success", "Task updated successfully");
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          showToast("error", data.error || "Failed to create task");
          return false;
        }
        showToast("success", "New task created successfully");
      }

      await refreshAllData();
      return true;
    } catch {
      showToast("error", "An error occurred while saving task");
      return false;
    }
  };

  // Handle Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to permanently delete this task?")) {
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to delete task");
        return;
      }

      showToast("success", "Task deleted successfully");
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
      await refreshAllData();
    } catch {
      showToast("error", "An error occurred while deleting task");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTask={() => {
          setTaskToEdit(null);
          setDefaultStatusForNewTask("TODO");
          setIsTaskModalOpen(true);
        }}
        onRefreshData={refreshAllData}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl text-xs font-medium">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === "dashboard" && (
          <DashboardView
            stats={stats}
            isLoading={isLoading}
            onSelectTask={(task) => setSelectedTask(task)}
            onNavigateToBoard={() => setActiveTab("kanban")}
          />
        )}

        {activeTab === "kanban" && (
          <KanbanBoard
            tasks={tasks}
            onTaskStatusChange={handleTaskStatusChange}
            onSelectTask={(task) => setSelectedTask(task)}
            onOpenNewTaskWithStatus={(status) => {
              setTaskToEdit(null);
              setDefaultStatusForNewTask(status);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === "list" && (
          <TaskListView
            tasks={tasks}
            users={users}
            onSelectTask={(task) => setSelectedTask(task)}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onTaskStatusChange={handleTaskStatusChange}
            onOpenNewTask={() => {
              setTaskToEdit(null);
              setDefaultStatusForNewTask("TODO");
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === "docs" && <ApiDocsView />}
      </main>

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatusForNewTask}
        users={users}
        onSave={handleSaveTask}
      />

      {/* Task Details Drawer with Comments & Activity Logs */}
      <TaskDetailsDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEditTask={(task) => {
          setSelectedTask(null);
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        onDeleteTask={handleDeleteTask}
        onTaskStatusChange={handleTaskStatusChange}
        onRefreshTask={refreshAllData}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
