"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  FileCode,
  Plus,
  RefreshCw,
  LogOut,
  Shield,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "kanban" | "list" | "docs";
  setActiveTab: (tab: "dashboard" | "kanban" | "list" | "docs") => void;
  onOpenNewTask: () => void;
  onRefreshData: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenNewTask, onRefreshData }: NavbarProps) {
  const { user, logout, switchDemoUser } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSwitchRole = async (targetRole: "ADMIN" | "USER") => {
    setIsSwitching(true);
    await switchDemoUser(targetRole);
    setIsSwitching(false);
    setUserDropdownOpen(false);
    onRefreshData();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <span className="font-bold text-lg tracking-tight">S</span>
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  Swan TaskFlow
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    Internship
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 hidden sm:block">Swan Digital Solutions</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "dashboard"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab("kanban")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "kanban"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Kanban className="w-4 h-4" />
                Kanban Board
              </button>

              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "list"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <ListTodo className="w-4 h-4" />
                List View
              </button>

              <button
                onClick={() => setActiveTab("docs")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "docs"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FileCode className="w-4 h-4" />
                API Docs
              </button>
            </nav>
          </div>

          {/* Right Action Tools & Profile */}
          <div className="flex items-center gap-3">
            {/* Seed Demo Data Button */}
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              title="Reset sample tasks and members"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin text-blue-600" : ""}`} />
              <span>{isSeeding ? "Resetting..." : "Reset Demo Data"}</span>
            </button>

            {/* Quick Create Task Button */}
            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm shadow-blue-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>

            {/* User Profile & Demo Switcher Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-200"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
                    <div className="flex items-center gap-1">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded border border-indigo-200">
                          <Shield className="w-2.5 h-2.5 mr-0.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-slate-100 px-1 rounded">
                          <UserIcon className="w-2.5 h-2.5 mr-0.5" /> Member
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 py-2 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {/* Quick Role Switcher for Assessment Reviewers */}
                    <div className="px-3 py-2 bg-slate-50 my-1">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Evaluator Quick-Switch
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleSwitchRole("ADMIN")}
                          disabled={isSwitching}
                          className={`flex items-center justify-between px-2 py-1.5 text-xs rounded-md border font-medium transition ${
                            user.role === "ADMIN"
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span>Admin Role</span>
                          {user.role === "ADMIN" && <Check className="w-3 h-3 ml-1" />}
                        </button>
                        <button
                          onClick={() => handleSwitchRole("USER")}
                          disabled={isSwitching}
                          className={`flex items-center justify-between px-2 py-1.5 text-xs rounded-md border font-medium transition ${
                            user.role === "USER"
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span>Member Role</span>
                          {user.role === "USER" && <Check className="w-3 h-3 ml-1" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1 py-1 px-2 rounded ${
              activeTab === "dashboard" ? "font-bold text-blue-600 bg-blue-50" : "text-slate-600"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("kanban")}
            className={`flex items-center gap-1 py-1 px-2 rounded ${
              activeTab === "kanban" ? "font-bold text-blue-600 bg-blue-50" : "text-slate-600"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-1 py-1 px-2 rounded ${
              activeTab === "list" ? "font-bold text-blue-600 bg-blue-50" : "text-slate-600"
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            List
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`flex items-center gap-1 py-1 px-2 rounded ${
              activeTab === "docs" ? "font-bold text-blue-600 bg-blue-50" : "text-slate-600"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Docs
          </button>
        </div>
      </div>
    </header>
  );
}
