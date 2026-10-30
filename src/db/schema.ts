import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  jsonb,
  numeric,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users & Authentication Tables (PRD F-01 & NextAuth Schema)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  bio: text("bio"),
  isPublic: boolean("is_public").default(true).notNull(),
  timezone: text("timezone").default("UTC"),
  preferences: jsonb("preferences").$type<{
    availableMinutesPerDay: number;
    availableDays: string[];
    coachingStyle: "compassionate" | "direct" | "analytical";
    primaryCategory: string;
    isPublic?: boolean;
    bio?: string;
    twitterHandle?: string;
    linkedinUrl?: string;
    onboardingCompleted?: boolean;
    pushNotificationsEnabled?: boolean;
    dailyBriefingTime?: string;
    dailyBriefingEnabled?: boolean;
    streakRemindersEnabled?: boolean;
  }>().default({
    availableMinutesPerDay: 45,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    coachingStyle: "compassionate",
    primaryCategory: "Personal Growth & Skills",
    isPublic: true,
    onboardingCompleted: false,
    pushNotificationsEnabled: false,
    dailyBriefingTime: "09:00",
    dailyBriefingEnabled: true,
    streakRemindersEnabled: true,
  }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// 2. Goals (PRD Section 8 - Core Entity)
export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  outcome: text("outcome").notNull(),
  category: text("category").notNull(),
  baseline: text("baseline"),
  targetMetric: text("target_metric"),
  targetValue: text("target_value"),
  targetDate: text("target_date").notNull(),
  status: text("status", {
    enum: ["active", "paused", "completed", "archived"],
  })
    .default("active")
    .notNull(),
  feasibilityRisk: text("feasibility_risk", {
    enum: ["low_risk", "moderate_risk", "high_risk"],
  })
    .default("moderate_risk")
    .notNull(),
  activePlanVersion: integer("active_plan_version").default(1).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// 3. Goal Constraints (PRD Section 8)
export const goalConstraints = pgTable("goal_constraints", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  valueJson: jsonb("value_json").notNull(),
});

// 4. Plan Versions (PRD Section 8 - Immutable Approved Versions)
export const planVersions = pgTable("plan_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  status: text("status", { enum: ["draft", "proposed", "approved"] })
    .default("approved")
    .notNull(),
  summary: text("summary"),
  createdBy: text("created_by").default("user").notNull(),
  promptVersion: text("prompt_version").default("v1.0"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 5. Milestones (PRD Section 8)
export const milestones = pgTable("milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  planVersionId: uuid("plan_version_id").references(() => planVersions.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(),
  status: text("status", { enum: ["pending", "in_progress", "completed"] })
    .default("pending")
    .notNull(),
  completionCriteriaJson: jsonb("completion_criteria_json")
    .$type<string[]>()
    .default([]),
  order: integer("order").default(1).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 6. Tasks (PRD Section 8 - Actionable Work Units)
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  milestoneId: uuid("milestone_id")
    .notNull()
    .references(() => milestones.id, { onDelete: "cascade" }),
  planVersionId: uuid("plan_version_id").references(() => planVersions.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  estimateMinutes: integer("estimate_minutes").default(30).notNull(),
  actualMinutes: integer("actual_minutes"),
  dueAt: text("due_at").notNull(),
  priority: text("priority", { enum: ["high", "normal", "low"] })
    .default("normal")
    .notNull(),
  status: text("status", {
    enum: ["todo", "in_progress", "completed", "skipped"],
  })
    .default("todo")
    .notNull(),
  completionCriteria: text("completion_criteria"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// 7. Task Dependencies (PRD Section 8)
export const taskDependencies = pgTable(
  "task_dependencies",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    dependsOnTaskId: uuid("depends_on_task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.taskId, table.dependsOnTaskId] }),
  ]
);

// 8. Task Events (PRD Section 8 - Audit Timeline)
export const taskEvents = pgTable("task_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventType: text("event_type", {
    enum: ["completed", "skipped", "rescheduled", "reopened"],
  }).notNull(),
  metadataJson: jsonb("metadata_json").default({}),
  occurredAt: timestamp("occurred_at", { mode: "date" }).defaultNow().notNull(),
});

// 9. Blockers (PRD Section 8)
export const blockers = pgTable("blockers", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
  category: text("category").notNull(),
  userNote: text("user_note"),
  status: text("status", { enum: ["open", "resolved", "dismissed"] })
    .default("open")
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 10. Plan Proposals (PRD Section 8 - Recovery & Adaptive Replans)
export const planProposals = pgTable("plan_proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  baseVersionId: uuid("base_version_id").references(() => planVersions.id, {
    onDelete: "set null",
  }),
  proposedDiffJson: jsonb("proposed_diff_json").notNull(),
  reason: text("reason").notNull(),
  status: text("status", {
    enum: ["pending", "accepted", "rejected", "expired"],
  })
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 11. Weekly Reviews (PRD Section 8)
export const weeklyReviews = pgTable("weekly_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  weekStart: text("week_start").notNull(),
  contentJson: jsonb("content_json").notNull(),
  promptVersion: text("prompt_version").default("v1.0"),
  status: text("status", { enum: ["draft", "published"] })
    .default("published")
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 12. AI Requests Ledger (PRD Section 8 & 4.4 - Cost & Rate Limit)
export const aiRequests = pgTable("ai_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
  taskType: text("task_type").notNull(),
  provider: text("provider").default("gemini").notNull(),
  model: text("model").default("gemini-1.5-pro").notNull(),
  status: text("status").notNull(),
  latencyMs: integer("latency_ms"),
  tokenUsage: integer("token_usage"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 13. Background Jobs (PRD Section 8 - Idempotent Async Jobs)
export const backgroundJobs = pgTable("background_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobType: text("job_type").notNull(),
  idempotencyKey: text("idempotency_key").unique(),
  payloadJson: jsonb("payload_json").notNull(),
  status: text("status", {
    enum: ["queued", "running", "succeeded", "failed", "dead_letter"],
  })
    .default("queued")
    .notNull(),
  attempts: integer("attempts").default(0).notNull(),
  runAt: timestamp("run_at", { mode: "date" }).defaultNow().notNull(),
  lockedAt: timestamp("locked_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 14. Notifications (PRD Section 8)
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  scheduledAt: timestamp("scheduled_at", { mode: "date" }),
  sentAt: timestamp("sent_at", { mode: "date" }),
  status: text("status", { enum: ["pending", "sent", "failed"] })
    .default("pending")
    .notNull(),
  dedupeKey: text("dedupe_key"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 15. Evidence (PRD Section 8 - Milestone Verification)
export const evidence = pgTable("evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  milestoneId: uuid("milestone_id")
    .notNull()
    .references(() => milestones.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  urlOrText: text("url_or_text").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// 16. Coach Messages (AI Coach Conversation History)
export const coachMessages = pgTable("coach_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "cascade" }),
  sender: text("sender").notNull(), // 'user' | 'coach'
  text: text("text").notNull(),
  recommendedNextAction: text("recommended_next_action"),
  reason: text("reason"),
  timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
});

// 17. User Streaks (Daily Execution Streak Engine)
export const userStreaks = pgTable("user_streaks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActivityDate: text("last_activity_date"), // YYYY-MM-DD
  totalTasksCompleted: integer("total_tasks_completed").default(0).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// 18. User Medals (Hard Goals & Milestones Achievements)
export const userMedals = pgTable("user_medals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
  medalKey: text("medal_key").notNull(), // 'titan_conqueror' | 'phoenix_resurgence' | 'summit_master' | 'iron_streak' | 'centurion' | 'first_blood'
  title: text("title").notNull(),
  description: text("description").notNull(),
  tier: text("tier", {
    enum: ["bronze", "silver", "gold", "platinum", "diamond"],
  })
    .default("gold")
    .notNull(),
  iconType: text("icon_type").default("trophy").notNull(),
  metadataJson: jsonb("metadata_json").default({}),
  unlockedAt: timestamp("unlocked_at", { mode: "date" }).defaultNow().notNull(),
});

// 19. Push Subscriptions (Web Push Notifications Engine)
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  goals: many(goals),
  accounts: many(accounts),
  sessions: many(sessions),
  taskEvents: many(taskEvents),
  notifications: many(notifications),
  pushSubscriptions: many(pushSubscriptions),
  coachMessages: many(coachMessages),
  streak: one(userStreaks, { fields: [users.id], references: [userStreaks.userId] }),
  medals: many(userMedals),
}));

export const userStreaksRelations = relations(userStreaks, ({ one }) => ({
  user: one(users, { fields: [userStreaks.userId], references: [users.id] }),
}));

export const userMedalsRelations = relations(userMedals, ({ one }) => ({
  user: one(users, { fields: [userMedals.userId], references: [users.id] }),
  goal: one(goals, { fields: [userMedals.goalId], references: [goals.id] }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
  milestones: many(milestones),
  tasks: many(tasks),
  planVersions: many(planVersions),
  planProposals: many(planProposals),
  weeklyReviews: many(weeklyReviews),
  constraints: many(goalConstraints),
  coachMessages: many(coachMessages),
  medals: many(userMedals),
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  goal: one(goals, { fields: [milestones.goalId], references: [goals.id] }),
  tasks: many(tasks),
  evidence: many(evidence),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  goal: one(goals, { fields: [tasks.goalId], references: [goals.id] }),
  milestone: one(milestones, {
    fields: [tasks.milestoneId],
    references: [milestones.id],
  }),
  events: many(taskEvents),
}));
