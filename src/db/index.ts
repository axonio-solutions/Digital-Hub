import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL is missing in environment variables');
} else {
  console.log('--- DB SETUP ---');
  console.log('DATABASE_URL is present.');
  console.log('------------------');
}

// Disable prefetch as it is not supported for "Transaction" pool mode (port 6543)
export const client = postgres(connectionString, { prepare: false });

export const db = drizzle({
  client,
  schema,
  casing: "snake_case",
});
