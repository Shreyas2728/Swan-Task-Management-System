# Swan Digital Solutions — Technical Interview Preparation Guide
> Use this guide to confidently explain your Task Management System during the evaluation interview.

---

## 🎯 60-Second Project Elevator Pitch

> *"For the Swan Digital Solutions assessment, I built a production-style Task Management System using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** with **SQLite/PostgreSQL**.*
>
> *I designed the system around practical real-world workflow requirements:*
> 1. *A secure **Authentication & RBAC system** with bcrypt password hashing and JWT sessions (supporting both Admin and Team Member permissions).*
> 2. *An interactive **Drag-and-Drop Kanban Board** that performs optimistic state updates for instant UI responsiveness, synchronizing directly with our REST API.*
> 3. *A **Real-Time Analytics Dashboard** with KPI counters, overdue alerts, and data visualizations for status and priority distributions.*
> 4. *A tabular **List View with multi-filtering, title search, and deadline sorting**, plus one-click **CSV export**.*
> 5. *Full auditability through timestamped **Task Comments and Activity History Logs**.*
>
> *I also added Docker support, automated test coverage, and an interactive in-app REST API documentation explorer."*

---

## 🧠 Key Architectural Decisions (Why You Chose Them)

### 1. Why Next.js App Router (Full Stack)?
- **Answer**: *"Next.js allows us to maintain a unified, type-safe full-stack application where API route handlers (`app/api/*`) and React client components share data contracts without code duplication or needing two separate deployment pipelines. It delivers faster turnaround, high performance with Server Components, and seamless deployment on Vercel or Docker."*

### 2. Why Prisma ORM with SQLite (Switchable to PostgreSQL)?
- **Answer**: *"I selected Prisma for its robust schema modeling and type-safe database queries. For local development, using SQLite guarantees zero-friction setup: an evaluator can clone the repo and immediately run the app without installing or configuring local database servers. For production deployment (like Vercel + Supabase/Neon), switching to PostgreSQL requires changing just a single line in `schema.prisma`."*

### 3. How does Role-Based Access Control (RBAC) work?
- **Answer**:
  - *"Each user has a `role` field (`ADMIN` or `USER`).*
  - *When a request arrives at protected routes like `DELETE /api/tasks/:id`, the API verifies the user's session.*
  - *If the user is an `ADMIN`, they can delete any task.*
  - *If they are a regular team member (`USER`), the system checks whether `session.userId === task.creatorId`. If not, it rejects the operation with a `403 Forbidden` error, preserving data integrity."*

### 4. How did you implement Drag-and-Drop on the Kanban Board?
- **Answer**:
  - *"I used HTML5 drag-and-drop APIs to keep the bundle lightweight without heavy external library dependencies.*
  - *When a card is dropped on a column, the UI applies an **optimistic update** to the local state immediately, giving the user instant visual feedback.*
  - *Simultaneously, a `PATCH /api/tasks/:id` request is dispatched with the new status. If the network call succeeds, dashboard stats refresh; if it fails, the local state rolls back gracefully."*

### 5. How did you implement Activity Logs / Audit Trail?
- **Answer**:
  - *"Whenever a task is created, status changed, priority updated, or reassigned, the corresponding API endpoint executes a relational creation in the `ActivityLog` table.*
  - *In Prisma, this is done either via nested writes or inside a `$transaction`, ensuring the task update and the audit log persist atomically."*

---

## 💡 Common Interview Questions & Answers

#### Q: How do you handle input validation?
> **Answer**: *"I used **Zod** to validate all incoming request payloads at runtime. Before any database operation, payloads pass through schemas like `createTaskSchema` or `registerSchema`. If validation fails, the API returns a structured `400 Bad Request` with field-specific error messages."*

#### Q: How do you prevent sensitive environment leaks?
> **Answer**: *"I set up `.env` for local secrets and included a `.gitignore` rule that excludes all `.env` files while committing a clean `.env.example` template with dummy keys."*

#### Q: How did you test your application?
> **Answer**: *"I wrote an automated test script (`npm test`) that verifies password hashing with bcrypt, Zod schema validation rules, relational database querying with Prisma, and dynamic overdue calculation logic."*

---

## 📋 Pre-Interview Checklist
- [x] Run `npm run seed` before demonstrating the app so you have rich, active data.
- [x] Demonstrate the **Dashboard** metrics and highlight the overdue task alert.
- [x] Demonstrate the **Kanban Board** by dragging a task from 'To Do' to 'In Progress'.
- [x] Open the **Task Details Drawer** to show the comment thread and live audit trail.
- [x] Demonstrate the **Role Switcher** (Admin vs Member) to show that members cannot delete other people's tasks.
- [x] Download a CSV export from the **List View**.
- [x] Show the in-app **API Docs** tab to illustrate your REST backend design.
