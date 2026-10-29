/**
 * Gemini AI Integration Service
 * Powers GoalForge Dynamic Roadmap Generation, Recovery Mode, and AI Coach
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PRIMARY_MODEL = "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

interface GeminiContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
    code?: number;
  };
}

async function callGemini(
  prompt: string,
  options: {
    systemInstruction?: string;
    responseMimeType?: string;
    model?: string;
    temperature?: number;
  } = {}
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in server environment.");
  }

  const model = options.model || PRIMARY_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const body: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.4,
    },
  };

  if (options.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  if (options.responseMimeType) {
    body.generationConfig.responseMimeType = options.responseMimeType;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data: GeminiContentResponse = await res.json();

    if (data.error) {
      // If primary model failed, retry with fallback model
      if (model !== FALLBACK_MODEL) {
        console.warn(`[Gemini] ${model} returned error, retrying with ${FALLBACK_MODEL}:`, data.error.message);
        return callGemini(prompt, { ...options, model: FALLBACK_MODEL });
      }
      throw new Error(`Gemini API Error: ${data.error.message || "Unknown error"}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini returned empty candidate response.");
    }

    return text;
  } catch (err: any) {
    if (model !== FALLBACK_MODEL) {
      console.warn(`[Gemini] Request failed with ${model}, retrying with ${FALLBACK_MODEL}:`, err.message);
      return callGemini(prompt, { ...options, model: FALLBACK_MODEL });
    }
    throw err;
  }
}

export class GeminiService {
  /**
   * Feature 1: Generate AI Adaptive Roadmap
   */
  static async generateRoadmap(params: {
    ambition: string;
    category: string;
    baseline?: string;
    targetDate: string;
    dailyMinutes: number;
    constraints?: string;
    coachingStyle?: string;
  }) {
    const systemInstruction = `You are GoalForge AI, an expert adaptive goal coach and behavioral systems architect.
Your mission is to decompose high-level human ambitions into structured, realistic, capacity-checked roadmaps.
PRD Rules:
1. Never exceed the user's daily capacity (${params.dailyMinutes} min/day) for any single daily task.
2. Structure into 3-4 sequential milestones with clear measurable verification criteria.
3. Each milestone must contain 2-4 bite-sized, actionable tasks with specific durations in minutes.
4. Distribute task due dates sequentially between today and the target deadline (${params.targetDate}).
5. Assess feasibility risk objectively: 'low_risk', 'moderate_risk', or 'high_risk' based on total estimated hours vs calendar capacity.
6. Return purely valid JSON adhering strictly to the requested schema.`;

    const prompt = `Create an adaptive roadmap for the following ambition:
- Goal Ambition: "${params.ambition}"
- Category: "${params.category}"
- Current Baseline / Starting Point: "${params.baseline || 'Beginner / starting from scratch'}"
- Target Deadline: "${params.targetDate}"
- Daily Available Capacity: ${params.dailyMinutes} minutes/day
- Schedule Constraints: "${params.constraints || 'None specified'}"

Output MUST be a JSON object with this exact structure:
{
  "title": "Clear concise goal title (max 50 chars)",
  "outcome": "Specific measurable target outcome",
  "targetMetric": "Measurable primary metric",
  "targetValue": "Target metric value to attain",
  "feasibilityRisk": "low_risk" | "moderate_risk" | "high_risk",
  "feasibilitySummary": "2-3 sentences evaluating why this goal is achievable within the schedule and pointing out workload buffers.",
  "assumptions": ["Assumption 1", "Assumption 2", "Assumption 3"],
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What is achieved in this phase",
      "dueDate": "YYYY-MM-DD",
      "completionCriteria": ["Criteria 1", "Criteria 2"],
      "tasks": [
        {
          "title": "Actionable task name",
          "description": "Concrete instructions for what to do",
          "estimatedMinutes": 30,
          "dueDate": "YYYY-MM-DD",
          "priority": "high" | "normal" | "low",
          "completionCriteria": "Verifiable done condition"
        }
      ]
    }
  ]
}`;

    const rawJson = await callGemini(prompt, {
      systemInstruction,
      responseMimeType: "application/json",
    });

    try {
      return JSON.parse(rawJson);
    } catch {
      // Clean potential markdown fences
      const cleaned = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    }
  }

  /**
   * Feature 3: Goal Recovery Mode (The Differentiator)
   */
  static async generateRecoveryPlan(params: {
    goalTitle: string;
    userReason: string;
    dailyCapacity: number;
    overdueTasks: Array<{
      id: string;
      title: string;
      dueDate: string;
      estimatedMinutes: number;
      priority: string;
    }>;
    upcomingTasks?: Array<{
      id: string;
      title: string;
      dueDate: string;
      estimatedMinutes: number;
    }>;
    todayDate: string;
  }) {
    const systemInstruction = `You are GoalForge AI's Recovery Engine.
PRD Principle: Never shame the user for broken streaks or missed days. Life happens.
Analyze the user's reported obstacle, diagnose cognitive overload or schedule squeeze, and distribute the slipped backlog across the upcoming 3 to 7 days so that NO single day exceeds ${params.dailyCapacity} minutes.
Provide a friction-free, immediate first restart step to eliminate procrastination today.
Return strictly valid JSON matching the specified schema.`;

    const prompt = `Active Goal: "${params.goalTitle}"
Today's Date: "${params.todayDate}"
User Daily Capacity: ${params.dailyCapacity} minutes/day
User Reported Blocker / Reason: "${params.userReason}"

Overdue / Slipped Tasks:
${JSON.stringify(params.overdueTasks, null, 2)}

Upcoming Tasks Context:
${JSON.stringify(params.upcomingTasks?.slice(0, 5) || [], null, 2)}

Return a JSON object with this exact structure:
{
  "triggerReason": "Concise summary of trigger (e.g. 2 overdue tasks detected / 60m backlog)",
  "recoverySummary": "Compassionate, scientifically sound 2-sentence rationale explaining how the backlog is safely staged without burnout or extending the final deadline.",
  "blockerHypotheses": [
    { "label": "Likely root cause label", "evidence": "Specific evidence based on user report and task difficulty" }
  ],
  "firstStep": "Ultra-clear, single friction-free action to do TODAY in 15-25 minutes to regain momentum.",
  "proposedChanges": [
    {
      "taskId": "task id from overdue list",
      "taskTitle": "task title",
      "action": "reschedule",
      "previousDueDate": "original due date",
      "newDueDate": "new realistic YYYY-MM-DD on or after ${params.todayDate}",
      "reason": "Why this task was moved to this date"
    }
  ],
  "tradeoffs": [
    "Guarantees daily study time stays under ${params.dailyCapacity} minutes",
    "Preserves final milestone completion date",
    "Eliminates late-night burnout anxiety"
  ]
}`;

    const rawJson = await callGemini(prompt, {
      systemInstruction,
      responseMimeType: "application/json",
    });

    try {
      return JSON.parse(rawJson);
    } catch {
      const cleaned = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    }
  }

  /**
   * Feature 4: Contextual AI Goal Coach
   */
  static async chatWithCoach(params: {
    message: string;
    goalContext: {
      title: string;
      category: string;
      deadline: string;
      feasibilityRisk: string;
      completedTasksCount: number;
      pendingTasksCount: number;
      overdueTasksCount: number;
      todayTasks: Array<{ title: string; estimatedMinutes: number }>;
      overdueTasks: Array<{ title: string; estimatedMinutes: number; dueDate: string }>;
    };
    coachingStyle?: "compassionate" | "direct" | "analytical";
    recentMessages?: Array<{ sender: string; text: string }>;
  }) {
    const style = params.coachingStyle || "compassionate";
    const systemInstruction = `You are the GoalForge AI Dedicated Coach.
Your coaching style is "${style}".
- Compassionate: Empathetic, supportive, removes guilt, focuses on micro-habits and psychological safety.
- Direct: Clear, no-nonsense, highly actionable, concise and candid.
- Analytical: Data-driven, metrics-oriented, pacing calculations and probability assessments.

Always ground advice strictly in the user's real plan context provided.
Do not spout generic motivational fluff.
Always end with a concrete, bite-sized Recommended Next Action that the user can execute right now.
Return strictly valid JSON.`;

    const prompt = `User Message: "${params.message}"

Active Goal Context:
- Goal: "${params.goalContext.title}" (${params.goalContext.category})
- Deadline: ${params.goalContext.deadline}
- Risk Level: ${params.goalContext.feasibilityRisk}
- Progress: ${params.goalContext.completedTasksCount} completed, ${params.goalContext.pendingTasksCount} pending, ${params.goalContext.overdueTasksCount} overdue
- Scheduled for Today: ${JSON.stringify(params.goalContext.todayTasks)}
- Overdue Tasks: ${JSON.stringify(params.goalContext.overdueTasks)}

Recent Conversation History:
${JSON.stringify(params.recentMessages?.slice(-4) || [])}

Return a JSON object with:
{
  "text": "Your personalized coaching response (2-3 concise paragraphs)",
  "recommendedNextAction": "Exact single action item to do right now",
  "reason": "Why this action is the optimal priority from a cognitive/pacing perspective",
  "suggestedFollowup": "Optional follow-up thought or question"
}`;

    const rawJson = await callGemini(prompt, {
      systemInstruction,
      responseMimeType: "application/json",
    });

    try {
      return JSON.parse(rawJson);
    } catch {
      const cleaned = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    }
  }
}
