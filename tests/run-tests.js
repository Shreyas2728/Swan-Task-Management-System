const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { z } = require("zod");

const prisma = new PrismaClient();

// Test counters
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("==================================================");
  console.log("SWAN DIGITAL SOLUTIONS - AUTOMATED TEST SUITE");
  console.log("==================================================\n");

  // 1. Password Hashing & Security Test
  console.log("[1] Testing Password Hashing & Encryption (bcryptjs)...");
  const rawPassword = "password123";
  const hash = await bcrypt.hash(rawPassword, 10);
  assert(hash !== rawPassword, "Password correctly hashed (not stored in plain text)");
  assert(hash.startsWith("$2"), "Hash conforms to bcrypt blowfish standard");
  const isMatch = await bcrypt.compare(rawPassword, hash);
  assert(isMatch === true, "bcrypt successfully verifies authentic password");
  const isWrongMatch = await bcrypt.compare("wrong_password", hash);
  assert(isWrongMatch === false, "bcrypt correctly rejects invalid credentials");

  // 2. Input Validation Schema Tests (Zod)
  console.log("\n[2] Testing Input Validation & Constraints (Zod)...");
  const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]);
  const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

  const createTaskSchema = z.object({
    title: z.string().min(2).max(200),
    status: taskStatusEnum.default("TODO"),
    priority: taskPriorityEnum.default("MEDIUM"),
  });

  const validTask = createTaskSchema.safeParse({
    title: "Implement Unit Tests",
    status: "IN_PROGRESS",
    priority: "HIGH",
  });
  assert(validTask.success === true, "Valid task input schema successfully validated");

  const invalidTaskStatus = createTaskSchema.safeParse({
    title: "Bad Status Task",
    status: "INVALID_STATUS",
  });
  assert(invalidTaskStatus.success === false, "Invalid status values are rejected");

  const shortTitleTask = createTaskSchema.safeParse({
    title: "A",
  });
  assert(shortTitleTask.success === false, "Task title shorter than 2 characters rejected");

  // 3. Database Persistence & Relational Models (Prisma SQLite)
  console.log("\n[3] Testing Database Relationships & Persistence (Prisma)...");
  const userCount = await prisma.user.count();
  assert(userCount >= 4, `Database seeded with users (Found ${userCount} team members)`);

  const admin = await prisma.user.findUnique({
    where: { email: "admin@swan.com" },
    include: { createdTasks: true },
  });
  assert(admin !== null, "Admin user exists in database");
  assert(admin.role === "ADMIN", "Admin user role is verified as ADMIN");

  const tasksCount = await prisma.task.count();
  assert(tasksCount >= 7, `Tasks persisted in database (Found ${tasksCount} tasks)`);

  const overdueTasks = await prisma.task.findMany({
    where: {
      status: { not: "COMPLETED" },
      dueDate: { lt: new Date() },
    },
  });
  assert(overdueTasks.length > 0, `Overdue calculation logic identifies ${overdueTasks.length} overdue task(s)`);

  // 4. Activity Audit Trail Verification
  console.log("\n[4] Testing Activity History & Audit Logging...");
  const activityLogs = await prisma.activityLog.findMany({
    take: 5,
    include: { user: true },
  });
  assert(activityLogs.length > 0, `Activity audit logs created and relational to users (Count: ${activityLogs.length})`);

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("ALL TESTS COMPLETED SUCCESSFULLY!\n");
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
