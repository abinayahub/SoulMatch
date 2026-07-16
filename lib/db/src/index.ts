import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const dbUrl = process.env.DATABASE_URL;

// Render internal URLs (e.g. dpg-xxx-a/dbname) don't need SSL.
// External URLs (.render.com or other hosted DBs) require SSL.
const isInternalRenderUrl = dbUrl.includes("@dpg-") && !dbUrl.includes(".render.com") && !dbUrl.includes("neon.tech") && !dbUrl.includes("supabase");

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: isInternalRenderUrl ? false : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });

export * from "./schema/index";
