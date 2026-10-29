import { getDb } from "@/db";
import { goals, milestones, tasks, planVersions, planProposals, coachMessages } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export class GoalRepository {
  static async listByUserId(userId: string) {
    const db = getDb();
    if (!db) return [];
    return db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  static async getById(goalId: string) {
    const db = getDb();
    if (!db) return null;
    const res = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1);
    return res[0] || null;
  }

  static async getFullGoalGraph(goalId: string) {
    const db = getDb();
    if (!db) return null;

    const [goal] = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1);
    if (!goal) return null;

    const goalMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.goalId, goalId))
      .orderBy(asc(milestones.order));

    const goalTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.goalId, goalId))
      .orderBy(asc(tasks.dueAt));

    const proposals = await db
      .select()
      .from(planProposals)
      .where(eq(planProposals.goalId, goalId))
      .orderBy(desc(planProposals.createdAt))
      .limit(1);

    const messages = await db
      .select()
      .from(coachMessages)
      .where(eq(coachMessages.goalId, goalId))
      .orderBy(desc(coachMessages.timestamp))
      .limit(50);

    return {
      goal,
      milestones: goalMilestones,
      tasks: goalTasks,
      activeProposal: proposals[0] || null,
      coachMessages: messages,
    };
  }

  static async createWithPlan(
    goalData: typeof goals.$inferInsert,
    milestonesData: Array<{
      tempId?: string;
      title: string;
      description?: string;
      dueDate: string;
      completionCriteriaJson?: string[];
      order: number;
    }>,
    tasksData: Array<{
      milestoneTempId?: string;
      milestoneIndex?: number;
      title: string;
      description?: string;
      estimateMinutes: number;
      dueAt: string;
      priority: "high" | "normal" | "low";
      status?: "todo" | "completed" | "in_progress" | "skipped";
      completionCriteria?: string;
    }>
  ) {
    const db = getDb();
    if (!db) throw new Error("Database not connected");

    // 1. Create Goal
    const createdGoals = await db.insert(goals).values(goalData).returning();
    const createdGoal = createdGoals[0];

    // 2. Create Plan Version v1
    const createdVersions = await db
      .insert(planVersions)
      .values({
        goalId: createdGoal.id,
        versionNumber: 1,
        status: "approved",
        summary: `Initial Plan v1 for ${createdGoal.title}`,
        createdBy: "user",
      })
      .returning();
    const planVersion = createdVersions[0];

    // 3. Create Milestones preserving mapping
    const milestoneMap = new Map<string, string>();
    const createdMilestones: Array<typeof milestones.$inferSelect> = [];

    for (let idx = 0; idx < milestonesData.length; idx++) {
      const m = milestonesData[idx];
      const inserted = await db
        .insert(milestones)
        .values({
          goalId: createdGoal.id,
          planVersionId: planVersion.id,
          title: m.title,
          description: m.description,
          dueDate: m.dueDate,
          status: idx === 0 ? "in_progress" : "pending",
          completionCriteriaJson: m.completionCriteriaJson || [],
          order: m.order || idx + 1,
        })
        .returning();

      const createdM = inserted[0];
      createdMilestones.push(createdM);
      if (m.tempId) {
        milestoneMap.set(m.tempId, createdM.id);
      }
      milestoneMap.set(`m_${idx + 1}`, createdM.id);
      milestoneMap.set(String(idx), createdM.id);
    }

    // 4. Create Tasks assigned to appropriate milestones
    const createdTasks: Array<typeof tasks.$inferSelect> = [];
    for (const t of tasksData) {
      let targetMilestoneId = createdMilestones[0]?.id;
      if (t.milestoneTempId && milestoneMap.has(t.milestoneTempId)) {
        targetMilestoneId = milestoneMap.get(t.milestoneTempId)!;
      } else if (t.milestoneIndex !== undefined && createdMilestones[t.milestoneIndex]) {
        targetMilestoneId = createdMilestones[t.milestoneIndex].id;
      }

      const inserted = await db
        .insert(tasks)
        .values({
          goalId: createdGoal.id,
          milestoneId: targetMilestoneId,
          planVersionId: planVersion.id,
          title: t.title,
          description: t.description,
          estimateMinutes: t.estimateMinutes,
          dueAt: t.dueAt,
          priority: t.priority,
          status: (t as any).status || "todo",
          completionCriteria: t.completionCriteria,
        })
        .returning();

      createdTasks.push(inserted[0]);
    }

    return {
      goal: createdGoal,
      planVersion,
      milestones: createdMilestones,
      tasks: createdTasks,
    };
  }

  static async updateStatus(
    goalId: string,
    status: "active" | "paused" | "completed" | "archived"
  ) {
    const db = getDb();
    if (!db) return null;
    const res = await db
      .update(goals)
      .set({ status, updatedAt: new Date() })
      .where(eq(goals.id, goalId))
      .returning();
    return res[0] || null;
  }

  static async deleteGoal(goalId: string) {
    const db = getDb();
    if (!db) return false;
    await db.delete(goals).where(eq(goals.id, goalId));
    return true;
  }

  /**
   * Auto-seed realistic initial demo goal for a user if they have 0 goals
   */
  static async seedInitialGoalIfEmpty(userId: string) {
    const db = getDb();
    if (!db) return null;

    const existing = await db
      .select({ id: goals.id })
      .from(goals)
      .where(eq(goals.userId, userId))
      .limit(1);

    if (existing.length > 0) return null;

    // Dynamically calculate dates relative to today
    const now = new Date();
    const formatDate = (offsetDays: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split("T")[0];
    };

    return this.createWithPlan(
      {
        userId,
        title: "AWS Solutions Architect Professional",
        outcome: "Attain AWS SAP-C02 certification with score >= 800",
        category: "Software Engineering & Cloud",
        baseline: "Already hold AWS Cloud Practitioner and 2 years general backend experience",
        targetMetric: "Practice exam score",
        targetValue: ">= 80% consistently on 3 consecutive full-length mocks",
        targetDate: formatDate(37),
        status: "active",
        feasibilityRisk: "moderate_risk",
        activePlanVersion: 1,
      },
      [
        {
          tempId: "m_1",
          title: "Networking & Complex VPC Multi-Region Topologies",
          description: "Transit Gateways, Direct Connect, Route 53 Private Hosted Zones, and Peering",
          dueDate: formatDate(-5),
          completionCriteriaJson: [
            "Diagram multi-region VPC design",
            "Pass AWS networking domain practice questions with 85%+",
          ],
          order: 1,
        },
        {
          tempId: "m_2",
          title: "Identity, Federation & Multi-Account Governance",
          description: "AWS Organizations, IAM Identity Center, SCP guardrails, and cross-account access",
          dueDate: formatDate(7),
          completionCriteriaJson: [
            "Implement multi-account root containment SCP",
            "Configure SAML/OIDC federated role assumptions",
          ],
          order: 2,
        },
        {
          tempId: "m_3",
          title: "Data Migration, Hybrid Cloud & Resilient Storage",
          description: "Storage Gateway, DataSync, Database Migration Service (DMS), and Snowball",
          dueDate: formatDate(20),
          completionCriteriaJson: [
            "Design zero-downtime Aurora global database migration plan",
          ],
          order: 3,
        },
        {
          tempId: "m_4",
          title: "Timed Full-Length Practice Exams & Review",
          description: "3 complete 75-question 180-minute simulation exams under timed conditions",
          dueDate: formatDate(35),
          completionCriteriaJson: [
            "Pass 3 separate mock exams with score >= 800",
          ],
          order: 4,
        },
      ],
      [
        {
          milestoneTempId: "m_1",
          title: "Build transit gateway hub-and-spoke VPC architecture lab",
          description: "Configure route tables and verify inter-VPC traffic isolation.",
          estimateMinutes: 45,
          dueAt: formatDate(-7),
          priority: "high",
          status: "completed",
          completionCriteria: "Ping between private subnets across 3 VPCs through transit gateway",
        },
        {
          milestoneTempId: "m_1",
          title: "Review Route 53 Split-Horizon DNS and Resolver Rules",
          description: "Study inbound/outbound DNS endpoints for hybrid on-premises connectivity.",
          estimateMinutes: 30,
          dueAt: formatDate(-6),
          priority: "normal",
          status: "completed",
          completionCriteria: "Complete chapter review notes & 10 flashcards",
        },
        // 2 overdue tasks to make Recovery Mode functional immediately
        {
          milestoneTempId: "m_2",
          title: "Configure IAM Role Delegation & Session Tagging policies",
          description: "Build ABAC JSON policies using aws:PrincipalTag condition keys.",
          estimateMinutes: 30,
          dueAt: formatDate(-2),
          priority: "high",
          status: "todo",
          completionCriteria: "Validated JSON policies deployed in test sandbox without syntax errors",
        },
        {
          milestoneTempId: "m_2",
          title: "Study AWS Organizations Service Control Policies (SCPs)",
          description: "Analyze inheritance rules, deny-all defaults, and root vs OU policy boundaries.",
          estimateMinutes: 30,
          dueAt: formatDate(-1),
          priority: "high",
          status: "todo",
          completionCriteria: "Summarize top 5 SCP architectural guardrails in notes",
        },
        // Today's task
        {
          milestoneTempId: "m_2",
          title: "Complete 20 Practice Questions on IAM Federation",
          description: "Focus on SAML 2.0 Web Identity federation and STS AssumeRoleWithWebIdentity.",
          estimateMinutes: 40,
          dueAt: formatDate(0),
          priority: "high",
          status: "todo",
          completionCriteria: "Score >= 75% on question set",
        },
        // Tomorrow's task
        {
          milestoneTempId: "m_2",
          title: "Review KMS Envelope Encryption and Key Rotation mechanics",
          description: "Understand asymmetric vs symmetric CMK policies and cross-account KMS grants.",
          estimateMinutes: 25,
          dueAt: formatDate(1),
          priority: "normal",
          status: "todo",
          completionCriteria: "Explain GenerateDataKey workflow from memory",
        },
        // Milestone checkpoint
        {
          milestoneTempId: "m_2",
          title: "Milestone 2 Assessment: Multi-Account Security Architecture",
          description: "Comprehensive 40-question scenario drill on security & compliance.",
          estimateMinutes: 45,
          dueAt: formatDate(6),
          priority: "high",
          status: "todo",
          completionCriteria: "Score >= 80% on scenario drill",
        },
      ]
    );
  }
}
