import { User } from "@/context/AuthContext";
export type { User };

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    role: string;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  taskId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    role?: string;
  };
  task?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  order: number;
  creatorId: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  creator?: User | null;
  comments?: Comment[];
  activityLogs?: ActivityLog[];
  _count?: {
    comments: number;
    activityLogs: number;
  };
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  statusBreakdown: {
    status: TaskStatus;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  priorityBreakdown: {
    priority: TaskPriority;
    label: string;
    count: number;
    color: string;
  }[];
  recentActivity: ActivityLog[];
  upcomingTasks: Task[];
}
