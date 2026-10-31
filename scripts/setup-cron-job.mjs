/**
 * Script to automatically register and configure an hourly cron job on cron-job.org
 * 
 * Usage:
 *   node scripts/setup-cron-job.mjs \
 *     --api-key="<CRON_JOB_ORG_API_KEY>" \
 *     --app-url="https://<your-domain>.vercel.app" \
 *     --cron-secret="<CRON_SECRET>"
 * 
 * Or via environment variables:
 *   CRON_JOB_API_KEY="..." APP_URL="..." CRON_SECRET="..." node scripts/setup-cron-job.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env if present
if (existsSync(resolve(process.cwd(), ".env"))) {
  try {
    const envContent = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val.trim();
        }
      }
    }
  } catch (err) {
    // Ignore error reading .env
  }
}

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name) {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  if (found) return found.slice(prefix.length).trim();
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1].trim();
  return null;
}

const apiKey = getArg("api-key") || process.env.CRON_JOB_API_KEY;
let appUrl = getArg("app-url") || process.env.APP_URL || process.env.NEXTAUTH_URL;
const cronSecret = getArg("cron-secret") || process.env.CRON_SECRET;

if (!apiKey) {
  console.error("\x1b[31mError: cron-job.org API Key is required.\x1b[0m");
  console.error("Provide it via --api-key=<KEY> or CRON_JOB_API_KEY in environment.");
  process.exit(1);
}

if (!appUrl || appUrl.includes("localhost")) {
  console.error("\x1b[31mError: Valid public APP_URL is required (not localhost).\x1b[0m");
  console.error("Provide it via --app-url=https://<your-app>.vercel.app");
  process.exit(1);
}

// Ensure https and clean trailing slash
appUrl = appUrl.trim().replace(/\/+$/, "");
if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
  appUrl = `https://${appUrl}`;
}

const targetUrl = cronSecret 
  ? `${appUrl}/api/cron/daily-digest?secret=${encodeURIComponent(cronSecret)}`
  : `${appUrl}/api/cron/daily-digest`;

console.log("\n🚀 Configuring Cron Job on cron-job.org...");
console.log(`📡 Target endpoint: ${targetUrl}`);

async function run() {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    // 1. Check existing jobs to avoid duplicates
    console.log("🔍 Checking existing cron jobs...");
    const listRes = await fetch("https://api.cron-job.org/jobs", { headers });
    if (!listRes.ok) {
      const errText = await listRes.text();
      throw new Error(`Failed to list jobs (HTTP ${listRes.status}): ${errText}`);
    }
    const listData = await listRes.json();
    const existingJob = listData.jobs?.find((j) => j.url?.includes("/api/cron/daily-digest"));

    const jobPayload = {
      job: {
        url: targetUrl,
        enabled: true,
        title: "GoalForge Hourly Digest & Streak Guard",
        saveResponses: true,
        requestMethod: 0, // GET
        schedule: {
          timezone: "UTC",
          hours: [-1],     // Every hour
          minutes: [0],    // At minute 0
          mdays: [-1],     // Every day of month
          months: [-1],    // Every month
          wdays: [-1],     // Every day of week
        },
        extendedData: {
          headers: cronSecret
            ? {
                Authorization: `Bearer ${cronSecret}`,
                "User-Agent": "GoalForge-CronTrigger/1.0",
              }
            : {
                "User-Agent": "GoalForge-CronTrigger/1.0",
              },
        },
      },
    };

    if (existingJob) {
      console.log(`ℹ️  Found existing job with ID: ${existingJob.jobId}. Updating it...`);
      const updateRes = await fetch(`https://api.cron-job.org/jobs/${existingJob.jobId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(jobPayload),
      });

      if (!updateRes.ok) {
        const errText = await updateRes.text();
        throw new Error(`Failed to update job (HTTP ${updateRes.status}): ${errText}`);
      }

      console.log("\x1b[32m✅ Successfully updated existing cron job!\x1b[0m");
      console.log(`Job ID: ${existingJob.jobId}`);
    } else {
      console.log("➕ Creating new hourly cron job...");
      const createRes = await fetch("https://api.cron-job.org/jobs", {
        method: "PUT",
        headers,
        body: JSON.stringify(jobPayload),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Failed to create job (HTTP ${createRes.status}): ${errText}`);
      }

      const createData = await createRes.json();
      console.log("\x1b[32m✅ Successfully created cron job on cron-job.org!\x1b[0m");
      console.log(`Job ID: ${createData.jobId}`);
    }

    console.log("\n⏰ Schedule: Runs at minute :00 of every hour (24 times/day)");
    console.log("🎯 Free plan compatibility: 100% compliant, bypasses Vercel Hobby limitations.\n");
  } catch (error) {
    console.error("\x1b[31m❌ Setup failed:\x1b[0m", error.message);
    process.exit(1);
  }
}

run();
