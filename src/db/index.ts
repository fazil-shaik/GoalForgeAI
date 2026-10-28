import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import ws from "ws";

// Support Node.js environment for Neon serverless
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

export function getDb() {
  if (!connectionString) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ [GoalForge DB] DATABASE_URL is not set. Please set DATABASE_URL in your .env file."
      );
    }
    return null;
  }
  const client = neon(connectionString);
  return drizzle(client, { schema });
}

export const db = getDb();
export * from "./schema";
