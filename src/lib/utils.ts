import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isPast, isToday, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "No due date";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid date";
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return format(d, "MMM d, yyyy · h:mm a");
}

export function isTaskOverdue(dueDate: string | Date | null | undefined, status: string): boolean {
  if (!dueDate || status === "COMPLETED") return false;
  const d = typeof dateToUtc(dueDate) === "string" ? new Date(dueDate) : dueDate;
  const now = new Date();
  // Due date is overdue if it has passed today's end or is in the past
  return new Date(d).getTime() < now.getTime() && !isToday(new Date(d));
}

function dateToUtc(date: string | Date) {
  return date;
}

export function getDueDateStatus(dueDate: string | Date | null | undefined, status: string): {
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
  className: string;
} {
  if (!dueDate) {
    return {
      label: "No due date",
      isOverdue: false,
      isDueToday: false,
      className: "text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
    };
  }

  const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (status === "COMPLETED") {
    return {
      label: format(d, "MMM d"),
      isOverdue: false,
      isDueToday: false,
      className: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    };
  }

  const now = new Date();
  if (isToday(d)) {
    return {
      label: "Due today",
      isOverdue: false,
      isDueToday: true,
      className: "text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    };
  }

  if (d.getTime() < now.getTime()) {
    const days = Math.abs(differenceInDays(now, d));
    const dayText = days === 0 ? "today" : `${days}d ago`;
    return {
      label: `Overdue (${dayText})`,
      isOverdue: true,
      isDueToday: false,
      className: "text-rose-700 bg-rose-50 border border-rose-200 font-medium dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 animate-pulse",
    };
  }

  const daysUntil = differenceInDays(d, now);
  return {
    label: `Due in ${daysUntil + 1}d`,
    isOverdue: false,
    isDueToday: false,
    className: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
  };
}

export const PRIORITY_CONFIG = {
  LOW: {
    label: "Low",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  MEDIUM: {
    label: "Medium",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  HIGH: {
    label: "High",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 font-semibold",
    dotClass: "bg-rose-500",
  },
} as const;

export const STATUS_CONFIG = {
  TODO: {
    label: "To Do",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    columnHeaderClass: "border-slate-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
    columnHeaderClass: "border-indigo-500",
  },
  COMPLETED: {
    label: "Completed",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    columnHeaderClass: "border-emerald-500",
  },
} as const;
