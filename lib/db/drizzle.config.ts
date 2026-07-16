import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

try {
  const envFile = fs.readFileSync(path.join(__dirname, "../../.env"), "utf8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
} catch (e) {}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
