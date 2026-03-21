import postgres from 'postgres';
import 'dotenv/config';

async function resetDB() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  // Add rejectUnauthorized: false if needed for external DBs
  const sql = postgres(connectionString, {
    max: 1,
    ssl: connectionString.includes('13.43.174.140') || connectionString.includes('supabase') ? { rejectUnauthorized: false } : 'require'
  });

  try {
    console.log("Dropping public schema cascade...");
    await sql`DROP SCHEMA public CASCADE;`;
    
    console.log("Recreating public schema...");
    await sql`CREATE SCHEMA public;`;
    
    console.log("Database successfully reset.");
  } catch (err) {
    console.error("Error resetting database:", err);
  } finally {
    await sql.end();
  }
}

resetDB();
