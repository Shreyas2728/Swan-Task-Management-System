# Swan Task Management System
> Production-grade Full Stack Task Management System built for **Swan Digital Solutions** Technical Assessment.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Zero_Config-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed-emerald)](./tests/run-tests.js)

---

## 📌 Project Overview

**Swan TaskFlow** is a modern, responsive, and robust full-stack task management platform designed to streamline team collaboration, sprint tracking, and project monitoring. The application features **Role-Based Access Control (Admin and Team Member)**, an interactive **Drag-and-Drop Kanban Board**, a dynamic **Real-Time Analytics Dashboard**, tabular **Task List with Multi-Filtering & Sorting**, timestamped **Task Comments and Audit Activity History**, and **One-Click CSV Export**.

---

## 🚀 Key Features

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- **User Registration & Login**: Built with secure `bcryptjs` password hashing (salt rounds: 10) and signed `jose` JSON Web Tokens (JWT).
- **Session Security**: Delivered via secure `HTTP-only` cookies + fallback `Bearer` Authorization headers for REST clients (Postman/curl).
- **Role Enforcement**:
  - **Administrators**: Can create, reassign, modify, and delete any task in the workspace.
  - **Team Members**: Can create tasks, manage statuses, and only delete tasks they personally authored.
- **Evaluator Quick-Switch**: One-click quick login for reviewers to switch roles seamlessly.

### 2. 📋 Kanban Board with Drag-and-Drop
- Interactive columns for **To Do**, **In Progress**, and **Completed**.
- **Native Drag-and-Drop**: Smooth drag interaction with drag handles, column hover indicators, and **optimistic UI updates** with automatic rollback on failure.
- Status, priority indicators, assignee avatars, comment badges, and due date countdowns.

### 3. 📊 Real-Time Analytics Dashboard
- **KPI Summary Cards**: Total Tasks, Pending Tasks, Completed Tasks (with completion % rate), and Overdue Tasks.
- **Attention Alert Banner**: Highlights overdue items with days elapsed.
- **Data Visualizations**:
  - **Status Distribution Chart**: Multi-segment progress visual showing workload division.
  - **Priority Breakdown**: Comparative bar charts for High, Medium, and Low priorities.
- **Upcoming Deadlines Panel**: Sorted chronological list of upcoming deliverables.
- **Recent Team Activity Feed**: Timestamped audit trail of all project changes.

### 4. 🔍 Search, Multi-Filter & Sorting
- **Real-Time Search**: Instant search by task title and description.
- **Multi-Filter Dropdowns**: Filter by Status (`To Do`, `In Progress`, `Completed`), Priority (`Low`, `Medium`, `High`), and Assignees.
- **Sorting Options**: Sort by Due Date (Earliest / Latest), Priority (High to Low / Low to High), Created Date, and Title (A-Z).
- **Responsive Table & Mobile Cards**: Adaptive layouts optimized for both desktop viewports and mobile screens.

### 5. 💬 Task Detail Drawer, Comments & Audit Log
- Slide-over detail drawer displaying full task metadata.
- **Task Comments Thread**: Post updates and feedback with timestamps and author profiles.
- **Audit Activity Trail**: Logs automated event history (creation, status changes, priority changes, reassignments).

### 6. 📄 Reporting & Bonus Utilities
- **One-Click CSV Export**: Download filtered task data directly as a `.csv` file with complete metadata.
- **Interactive API Documentation**: In-app visual API explorer detailing request bodies, parameters, and sample responses.
- **Demo Reset / Re-seed**: One-click seed button to restore sample test data at any time.

---

## 🛠️ Technology Stack & Justification

| Layer | Technology | Justification |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (App Router) + React 19** | Server/Client components, fast routing, and clean unified architecture. |
| **Language** | **TypeScript 5.9** | Strict static type safety across API routes, UI components, and Prisma schemas. |
| **Styling & UI** | **Tailwind CSS v4 + Lucide Icons** | Utility-first CSS, modern responsive design system, and accessible iconography. |
| **Backend & REST API** | **Next.js Route Handlers** | Standard RESTful API endpoints with structured JSON responses and HTTP status codes. |
| **Validation** | **Zod 4.6** | Schema-based runtime validation for registration, login, tasks, and comments. |
| **Database & ORM** | **Prisma 6.4 + SQLite / PostgreSQL** | Type-safe queries, migration system, relational foreign keys, zero-config local run. |
| **Security** | **bcryptjs + jose JWT** | Cryptographic password hashing and edge-compatible token signing. |
| **Containerization** | **Docker & Docker Compose** | Multi-stage production container build for consistent deployment. |

---

## 👥 Demo Login Credentials

For evaluation purposes, the database is pre-seeded with realistic team members and tasks:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@swan.com` | `password123` | Full administrative privileges (manage, reassign, delete any task) |
| **Member** | `sarah@swan.com` | `password123` | Standard team member (manage assigned tasks, delete authored tasks) |
| **Member** | `david@swan.com` | `password123` | Standard team member |
| **Member** | `priya@swan.com` | `password123` | Standard team member |

> **Evaluator Tip**: You can also use the one-click **"Evaluator Quick-Switch"** buttons right on the Login page or in the top navigation bar!

ive Application Deployment + README
- Built with clean code practices, maintainable component hierarchy, strict type checking, and zero external UI component libraries.
