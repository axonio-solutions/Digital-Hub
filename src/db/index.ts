import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || import.meta.env.DATABASE_URL!;
console.log("DB connection string (server):", connectionString ? connectionString.replace(/:[^@:]*@/, ":***@") : "UNDEFINED");

// Prevent multiple connections during HMR, but allow re-init if config changes
const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
    lastConnStr: string | undefined;
};

if (globalForDb.lastConnStr !== connectionString) {
    if (globalForDb.conn) {
        globalForDb.conn.end();
        globalForDb.conn = undefined;
    }
    globalForDb.lastConnStr = connectionString;
}

const conn = globalForDb.conn ?? postgres(connectionString, { 
    max: 10,
    ssl: connectionString.includes('13.43.174.140') ? { rejectUnauthorized: false } : 'require'
});
if (import.meta.env.MODE !== "production") globalForDb.conn = conn;

export const db = drizzle({ client: conn, schema });
