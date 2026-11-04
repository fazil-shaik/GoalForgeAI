# GoalForge

GoalForge is a full-stack, AI-powered goal execution platform designed to transform ambiguous personal and professional ambitions into structured, actionable daily execution plans. Built on Next.js 16, React 19, Drizzle ORM, Neon PostgreSQL, and Google Gemini, the platform combines dynamic project roadmap decompilation, real-time accountability coaching, adaptive schedule recovery, gamification streaks, and multi-device Web Push notifications.

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Core Features and Implementation](#core-features-and-implementation)
  - [AI Roadmap Decompilation](#ai-roadmap-decompilation)
  - [Conversational AI Accountability Coach](#conversational-ai-accountability-coach)
  - [Adaptive Schedule Recovery Mode](#adaptive-schedule-recovery-mode)
  - [Daily Task Execution Engine](#daily-task-execution-engine)
  - [Gamification, Streaks, and Medals](#gamification-streaks-and-medals)
  - [Web Push Notification Engine and Cron Digest](#web-push-notification-engine-and-cron-digest)
  - [Concurrency and Rate Limiting](#concurrency-and-rate-limiting)
- [System Architecture and Layering](#system-architecture-and-layering)
- [Data Models and Database Schema](#data-models-and-database-schema)
- [API Route Reference](#api-route-reference)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Step-by-Step Installation and Setup](#step-by-step-installation-and-setup)
- [Configuring Automated Cron Notifications](#configuring-automated-cron-notifications)
- [Production Deployment](#production-deployment)
- [Troubleshooting and Common Issues](#troubleshooting-and-common-issues)
- [License](#license)

---

## Architectural Overview

GoalForge follows a layered serverless architecture optimized for high performance, edge compatibility, and reliable background synchronization:

1. **Client Interface**: Built with Next.js 16 App Router and React 19 Server/Client Components. It uses Tailwind CSS v4 for styling, Lucide React for iconography, Three.js for interactive ambient visual elements, and Canvas Confetti for celebratory milestone interactions.
2. **API and Handler Layer**: Next.js Route Handlers validate payloads using Zod, authenticate sessions via NextAuth.js, and delegate business logic to dedicated domain services.
3. **Domain Service Layer**: Decoupled service classes encapsulate core workflows, such as roadmap decomposition with Google Gemini, recovery plan diff generation, push notification delivery, and token rate limiting.
4. **Repository and Data Access Layer**: The repository pattern abstracts database operations using Drizzle ORM and the Neon serverless HTTP/WebSocket driver, supporting connection pooling and resilient transactional mutations.
5. **Background Scheduling and Workers**: Next.js Server Lifecycle Instrumentation initializes in-process timers, complemented by external cron job webhooks for daily morning briefings and evening streak reminders.

---

## Core Features and Implementation

### AI Roadmap Decompilation

When a user submits a high-level outcome (for example: "Deploy a distributed microservices cluster in Go by Q3"), the system prompts Google Gemini to deconstruct the target into a multi-tiered plan:

- **Constraint Analysis**: Evaluates user availability (minutes per day and available weekdays) and baseline competencies.
- **Milestone Generation**: Deconstructs the goal into sequential, ordered milestones with concrete due dates and explicit completion criteria.
- **Atomic Task Breakdown**: Breaks milestones down into granular tasks with time estimates (in minutes), dependencies (`depends_on_task_id`), and priorities (`high`, `normal`, `low`).
- **Feasibility Risk Scoring**: Returns structured risk metrics (`low_risk`, `moderate_risk`, `high_risk`) to warn users about over-ambitious timelines before committing.
- **Version Control**: Stores generated plans in an immutable `plan_versions` table, enabling historical rollbacks and non-destructive plan iterations.

### Conversational AI Accountability Coach

An interactive chat assistant maintains contextual awareness of the user active goal, upcoming deadlines, and past execution consistency:

- **Configurable Personas**: Supports three distinct coaching methodologies stored in user preferences:
  - `compassionate`: Empathetic, supportive, and focused on sustainable habit building.
  - `direct`: Firm, no-nonsense accountability emphasizing strict discipline and execution.
  - `analytical`: Data-driven, milestone-focused, and oriented around throughput metrics.
- **Action Recommendations**: Responses include structured recommendations for immediate next actions alongside analytical justification.
- **Persistent History**: Conversations are logged in the `coach_messages` table to maintain continuity across sessions.

### Adaptive Schedule Recovery Mode

Life interruptions often cause tasks to slip, leading to demoralizing backlogs. GoalForge avoids this through intelligent recovery proposals:

- **Slippage Detection**: Scans the user timeline for overdue tasks, missed milestones, and low completion velocity.
- **Diagnostic Synthesis**: Gemini evaluates the backlog against remaining days to the target date.
- **Proposal Diffs**: Generates a JSON diff proposing task rescheduling, timeline extensions, or non-essential task pruning.
- **User Approval Workflow**: Recovery proposals remain in `pending` status until the user explicitly reviews, accepts, or dismisses them. Once approved, the plan version increments and task due dates update atomically.

### Daily Task Execution Engine

- **Curated Daily Queue**: The `/api/tasks/today` endpoint evaluates task priorities, dependencies, and scheduled dates to deliver an actionable daily list.
- **Execution Lifecycle**: Tasks transition through `todo`, `in_progress`, `completed`, and `skipped`.
- **Audit Trails**: Every status transition logs a timestamped record in `task_events` for progress auditing, analytics, and streak calculations.
- **Dependency Enforcement**: Dependent tasks cannot be marked complete until prerequisites are resolved.

### Gamification, Streaks, and Medals

- **Streak Tracking Engine**: Computes continuous daily streaks, longest streak records, and total completed tasks. Streaks increment on consecutive days and reset if an active execution window closes without completion.
- **Milestone Achievements and Medals**: Automated event listeners evaluate medal criteria and unlock tiered badges (`bronze`, `silver`, `gold`, `platinum`, `diamond`):
  - `first_blood`: Completed first task in the system.
  - `iron_streak`: Maintained a continuous 7-day execution streak.
  - `summit_master`: Successfully completed all tasks in a major milestone.
  - `phoenix_resurgence`: Successfully activated and resolved a Recovery Mode plan.
  - `centurion`: Surpassed 100 total completed tasks.
  - `titan_conqueror`: Fully accomplished an entire primary goal.
- **Global Leaderboard**: Surfaces top performers across the platform, ranked by streak length, total task throughput, and unlocked medals. Users can toggle profile visibility between public and private.

### Web Push Notification Engine and Cron Digest

- **Standard Web Push Protocol**: Implemented using the `web-push` library with VAPID (Voluntary Application Server Identification) key authentication.
- **Browser Service Worker**: `public/sw.js` handles push events, renders rich notifications with custom actions, and navigates users to relevant dashboard views upon click.
- **Daily Digest Pipeline**: The `/api/cron/daily-digest` route processes users in batches:
  - Verifies user timezones and scheduled morning briefing times (default: 09:00).
  - Composes customized summaries highlighting the day priority tasks.
  - Sends evening reminders if daily tasks remain incomplete before midnight.
- **Invalid Subscription Cleanup**: Automatically purges expired or unsubscribed endpoints (HTTP 404/410) from the database to maintain clean state.

### Concurrency and Rate Limiting

- **Quota Enforcement**: Limits AI generation requests per user per 24-hour cycle via `AI_DAILY_USER_QUOTA`.
- **Concurrency Throttling**: Restricts total simultaneous Gemini calls across the system via `AI_GLOBAL_CONCURRENCY_LIMIT`.
- **Auditing and Observability**: Every AI invocation logs execution latency, token counts, model identifier, and estimated costs into the `ai_requests` table.
- **Fallback Resilience**: Uses Redis when configured; falls back gracefully to an in-memory sliding window rate limiter when Redis is omitted.

---

## System Architecture and Layering

The application structure enforces strict separation of concerns across four primary tiers:

```
+-------------------------------------------------------------+
|                     Client Tier (React 19)                  |
|  - App Router Pages (/dashboard, /auth, /)                  |
|  - Feature Components (GoalBuilder, DailyTasks, AiCoach)    |
|  - Three.js 3D Backgrounds and Confetti UI Modals           |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                 API and Middleware Layer                    |
|  - Route Handlers (/api/goals, /api/tasks, /api/ai)         |
|  - NextAuth Session Validation and Zod Request Parsing      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     Domain Service Layer                    |
|  - GeminiService (Prompt engineering and model calls)       |
|  - GoalService, TaskService, RecoveryService                |
|  - PushNotificationService, RateLimitService                |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                  Repository and Database Tier               |
|  - Drizzle ORM Repositories (Task, Goal, User, Streak, etc) |
|  - Neon Serverless PostgreSQL with Connection Pooling       |
+-------------------------------------------------------------+
```

---

## Data Models and Database Schema

The database schema is defined in `src/db/schema.ts` using Drizzle ORM:

- **`users`**: User identity, profile metadata, bio, timezone, and JSONB preferences (daily available minutes, coaching style, notification toggles).
- **`accounts`**, **`sessions`**, **`verification_tokens`**: NextAuth.js authentication and OAuth provider linking tables.
- **`goals`**: Primary goal records containing title, desired outcome, category, baseline, target metric, target date, feasibility risk, and active plan version.
- **`goal_constraints`**: Specific constraints attached to a goal, including weekday availability and time budgets.
- **`plan_versions`**: Immutable record of plan iterations, capturing version numbers, change summaries, and prompt versions.
- **`milestones`**: Key checkpoints within a goal plan, including target due date, order, and completion criteria.
- **`tasks`**: Discrete units of work containing estimated minutes, actual minutes, scheduled date, priority, completion criteria, and status.
- **`task_dependencies`**: Many-to-many relationship tracking prerequisite tasks.
- **`task_events`**: Immutable audit log of task status transitions (`completed`, `skipped`, `rescheduled`, `reopened`).
- **`plan_proposals`**: Pending and historical recovery proposals generated by AI, storing the JSON diff and justification.
- **`coach_messages`**: Chat conversation history between users and the AI Coach, including recommended next actions.
- **`user_streaks`**: Tracks current streak length, longest historical streak, total completed tasks, and last activity date.
- **`user_medals`**: Records earned achievements, medal keys, tiers, and unlock timestamps.
- **`push_subscriptions`**: Browser push notification subscriptions storing endpoints and encryption keys (`p256dh`, `auth`).
- **`ai_requests`**: Comprehensive telemetry ledger recording AI request types, token usage, latency, and estimated cost.
- **`background_jobs`**: Queue for asynchronous or deferred tasks with idempotency keys and retry counters.
- **`notifications`**: In-app and outbound notification event log.
- **`blockers`**: Self-reported user obstacles tied to goals or tasks.
- **`evidence`**: Proof of completion (links or text notes) attached to milestones.
- **`weekly_reviews`**: Periodic summary reviews evaluating weekly execution performance.

---

## API Route Reference

### Authentication and User Management

- `GET /api/auth/[...nextauth]` - Handles Google OAuth sign-in, callback, session verification, and sign-out.
- `GET /api/user/profile` - Fetches the authenticated user profile, preferences, and activity status.
- `PATCH /api/user/profile` - Updates profile bio, visibility settings, coaching preferences, and notification times.
- `GET /api/user/streak` - Returns streak metrics, current streak count, and total completed task count.
- `GET /api/user/medals` - Returns unlocked medals and progress toward pending achievements.
- `GET /api/user/rate-limits` - Returns current AI token and call quota consumption for the day.

### Goals and Milestones

- `GET /api/goals` - Lists all goals belonging to the authenticated user.
- `POST /api/goals` - Creates a new goal and initializes default plan tracking.
- `GET /api/goals/[id]` - Returns comprehensive goal details including active plan, milestones, and progress metrics.
- `PATCH /api/goals/[id]` - Modifies goal parameters or status (`active`, `paused`, `completed`, `archived`).
- `DELETE /api/goals/[id]` - Removes a goal and cascades cleanup across dependent records.
- `POST /api/goals/[id]/complete` - Marks a goal as completed and triggers the Titan Conqueror medal evaluation.

### Daily Tasks and Execution

- `GET /api/tasks` - Lists tasks filtered by goal ID or date parameters.
- `GET /api/tasks/today` - Returns the curated task queue for the current calendar day.
- `POST /api/tasks/[id]/complete` - Marks a task completed, recalculates streak, and checks for milestone/medal unlocks.
- `POST /api/tasks/[id]/skip` - Records a skipped task with an optional user justification.
- `POST /api/tasks/[id]/reschedule` - Modifies a task scheduled due date with an audit event log.

### Artificial Intelligence

- `POST /api/ai/generate-roadmap` - Accepts goal parameters, calls Gemini, and creates structured milestones and tasks.
- `POST /api/ai/coach` - Submits a prompt to the AI coach and returns an empathetic or direct accountability response.
- `POST /api/ai/recovery-plan` - Analyzes overdue tasks and generates a reschedule proposal diff.

### Plan Proposals

- `POST /api/proposals/[id]/approve` - Applies a pending recovery proposal, updating task dates and incrementing plan version.
- `POST /api/proposals/[id]/dismiss` - Dismisses a proposed plan revision without modifying active tasks.

### Push Notifications and Cron

- `POST /api/notifications/subscribe` - Stores or updates a browser push subscription for the authenticated user.
- `POST /api/notifications/unsubscribe` - Deactivates an existing push subscription.
- `POST /api/notifications/test` - Dispatches an immediate test push notification to verify device connectivity.
- `GET /api/cron/daily-digest` - Scheduled endpoint triggering morning briefings and streak reminders across eligible users.

### Social and Community

- `GET /api/leaderboard` - Returns the global leaderboard ranking public user profiles by streak and task velocity.

---

## Project Directory Structure

```
goalforge/
|-- public/
|   |-- sw.js                          # Service Worker handling Web Push notifications
|   `-- images/                        # Static UI assets and badges
|-- scripts/
|   `-- setup-cron-job.mjs             # Automates cron-job.org registration for daily digests
|-- src/
|   |-- app/
|   |   |-- api/                       # Next.js Route Handlers (Auth, Goals, Tasks, AI, Cron)
|   |   |-- auth/                      # Dedicated authentication and sign-in page
|   |   |-- dashboard/                 # Protected dashboard and main application views
|   |   |-- globals.css                # Tailwind CSS v4 design tokens and theme rules
|   |   |-- layout.tsx                 # Root HTML shell with fonts and session providers
|   |   `-- page.tsx                   # Public landing page with 3D showcase
|   |-- components/
|   |   |-- 3d/                        # Three.js interactive visual components
|   |   |-- dashboard/                 # Feature components (AiCoach, DailyTask, GoalBuilder, etc.)
|   |   |-- landing/                   # Interactive landing page showcase and ambient background
|   |   |-- providers/                 # NextAuth session context wrapper
|   |   `-- ui/                        # Reusable UI primitives (loaders, avatars, buttons)
|   |-- context/
|   |   |-- AuthContext.tsx            # Client authentication state utilities
|   |   `-- GoalContext.tsx            # Active goal selection and shared dashboard state
|   |-- db/
|   |   |-- index.ts                   # Neon serverless client and Drizzle database instance
|   |   |-- init.ts                    # Idempotent database table bootstrap script
|   |   |-- schema.ts                  # Drizzle ORM PostgreSQL schema definitions
|   |   `-- migrations/                # Drizzle Kit generated SQL migration files
|   |-- lib/
|   |   `-- pushManager.ts             # Client-side service worker and push subscription utilities
|   |-- server/
|   |   |-- auth/                      # NextAuth configuration and session retrieval helpers
|   |   |-- repositories/              # Database access layer for all domain entities
|   |   `-- services/                  # Business logic (Gemini, Push, Task, Recovery, RateLimit)
|   |-- types/                         # Shared TypeScript interfaces and domain type definitions
|   |-- instrumentation.ts             # Server startup hook for background scheduling
|   `-- middleware.ts                  # Route protection and session authentication guard
|-- drizzle.config.ts                  # Drizzle Kit configuration file
|-- next.config.ts                     # Next.js build and runtime configuration
|-- package.json                       # Project dependencies and script declarations
|-- tsconfig.json                      # TypeScript configuration
`-- .env.example                       # Reference environment variable template
```

---

## Prerequisites

Before setting up GoalForge locally, ensure you have the following installed and configured:

1. **Node.js**: Version 20.0.0 or higher.
2. **Package Manager**: `npm` (version 9 or higher), `pnpm`, or `yarn`.
3. **Neon PostgreSQL Database**: A serverless PostgreSQL database from [Neon](https://neon.tech).
4. **Google Cloud Console Account**: For configuring Google OAuth 2.0 authentication credentials.
5. **Google AI Studio Key**: An API key with access to Google Gemini models from [Google AI Studio](https://aistudio.google.com/).

---

## Environment Configuration

Create a `.env` file in the root of the project by copying `.env.example`:

```bash
cp .env.example .env
```

Configure each variable with your actual credentials:

```ini
# Database Connection (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/<database>?sslmode=require"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-nextauth-secret-min-32-chars"

# Application Base URL (Used for email links and push callbacks)
APP_BASE_URL="http://localhost:3000"

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"

# Web Push Notifications (VAPID Configuration)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-vapid-key"
VAPID_PRIVATE_KEY="your-private-vapid-key"
VAPID_SUBJECT="mailto:support@yourdomain.com"

# Cron Job Webhook Security Token
CRON_SECRET="your-randomly-generated-secure-cron-secret-token"

# AI Rate Limiting and Quota Settings (Optional defaults)
AI_DAILY_USER_QUOTA=50
AI_GLOBAL_CONCURRENCY_LIMIT=10

# Optional Infrastructure (Leave empty if using in-memory fallbacks)
REDIS_URL=""
QUEUE_CONNECTION_URL=""
ERROR_TRACKING_DSN=""
```

### Generating Secret Keys

#### NextAuth Secret

Generate a cryptographically secure 32-byte secret using OpenSSL:

```bash
openssl rand -base64 32
```

Paste the output into `NEXTAUTH_SECRET`.

#### VAPID Keys for Web Push

Generate a fresh VAPID public and private key pair using `web-push`:

```bash
npx web-push generate-vapid-keys
```

Copy the printed public key into `NEXTPUBLIC_VAPID_PUBLIC_KEY` and the private key into `VAPID_PRIVATE_KEY`.

#### Google OAuth Setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Under **APIs and Services** > **Credentials**, create an **OAuth 2.0 Client ID**.
4. Set the application type to **Web application**.
5. Add the following to **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-production-domain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret into your `.env` file.

---

## Step-by-Step Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/goalforge.git
cd goalforge
```

### 2. Install Project Dependencies

Install all required production and development dependencies:

```bash
npm install
```

### 3. Initialize the Database Schema

GoalForge uses Drizzle ORM with Neon PostgreSQL. You can push the schema directly to your Neon database instance using Drizzle Kit:

```bash
npx drizzle-kit push
```

Alternatively, the application includes an idempotent table verification script that checks and updates missing tables upon server boot.

### 4. Start the Local Development Server

Run the development server with Webpack bundling (as defined in `package.json`):

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:3000
```

Sign in with your Google account to create your user profile and test the onboarding flow.

---

## Configuring Automated Cron Notifications

GoalForge sends scheduled morning briefings and evening streak reminders via the `/api/cron/daily-digest` route. The route requires an HTTP Bearer authorization header matching `CRON_SECRET`.

### Option A: Automated Configuration via cron-job.org

The repository includes a setup script in `scripts/setup-cron-job.mjs` to automatically register an hourly execution schedule on cron-job.org:

```bash
node scripts/setup-cron-job.mjs \
  --api-key="your-cron-job-org-api-key" \
  --app-url="https://your-domain.vercel.app" \
  --cron-secret="your-secure-cron-secret-token"
```

Or execute via the package script after setting environment variables:

```bash
npm run cron:setup
```

### Option B: Vercel Cron Jobs

When hosting on Vercel, configure `vercel.json` in the root directory:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 * * * *"
    }
  ]
}
```

Vercel automatically passes `CRON_SECRET` in the `Authorization: Bearer <token>` header when configured in the Vercel project environment variables.

### Option C: Manual cURL Verification

You can trigger and verify the cron job manually at any time:

```bash
curl -X GET "http://localhost:3000/api/cron/daily-digest" \
  -H "Authorization: Bearer your-secure-cron-secret-token"
```

Expected response format:

```json
{
  "success": true,
  "processedUsers": 12,
  "briefingsSent": 4,
  "remindersSent": 3,
  "failedDeliveries": 0,
  "timestamp": "2026-11-04T09:00:00.000Z"
}
```

---

## Production Deployment

### Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Configure the **Build Command** to:
   ```bash
   npm run build
   ```
4. In the Vercel project **Settings** > **Environment Variables**, add all keys from your `.env` file:
   - Ensure `NEXTAUTH_URL` points to your production URL (`https://your-app.vercel.app`).
   - Ensure `APP_BASE_URL` matches your production domain.
   - Configure your production database connection in `DATABASE_URL`.
   - Update authorized redirect URIs in Google Cloud Console to match your production domain.
5. Deploy the application.

---

## Troubleshooting and Common Issues

### 1. Database Connection Failures
- Verify that `DATABASE_URL` includes `?sslmode=require` as required by Neon serverless connections.
- Ensure your network environment permits outbound WebSocket or HTTP connections on standard PostgreSQL ports.

### 2. Google OAuth Callback Errors
- Ensure the callback URL configured in the Google Cloud Console precisely matches the active deployment URL (`http://localhost:3000/api/auth/callback/google` in development).
- Check that `NEXTAUTH_URL` reflects the exact origin protocol and port.

### 3. Push Notifications Not Triggering
- Push notifications require a secure context (HTTPS) in production. On `localhost`, standard HTTP is permitted by modern browsers.
- Ensure notification permissions are explicitly granted in the browser.
- Verify that `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` were generated together from the same key pair.

### 4. Gemini API Rate Limits
- If receiving HTTP 429 status codes from Google Gemini, verify your project quotas in Google AI Studio.
- The built-in `RateLimitService` monitors daily consumption and will throttle users exceeding `AI_DAILY_USER_QUOTA` to protect API credit allocations.

---

## License

This project is licensed under the MIT License. You are free to modify, distribute, and integrate this software into your own projects.
