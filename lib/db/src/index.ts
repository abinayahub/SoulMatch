import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Strip sslmode from URL - we handle SSL via Pool config directly
const dbUrl = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, "").replace(/[?&]$/, "");

// Internal Render URLs: hostname like dpg-xxx-a (no TLD) → no SSL needed
// External URLs: .render.com / neon.tech / supabase etc → SSL with relaxed cert
const hostMatch = dbUrl.match(/@([^/:]+)/);
const host = hostMatch ? hostMatch[1] : "";
const isExternal = host.includes(".") && host !== "localhost";

console.log(`[DB] Connecting to host="${host}" isExternal=${isExternal}`);

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: isExternal ? { rejectUnauthorized: false } : false,
});

// Log connection result on startup
pool.connect()
  .then((client) => {
    console.log("[DB] Connection successful ✅");
    client.release();
  })
  .catch((err) => {
    console.error("[DB] Connection FAILED ❌:", err.message);
  });

export const db = drizzle(pool, { schema });

export * from "./schema/index";
