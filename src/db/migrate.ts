import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index.ts";
import "dotenv/config";

async function runMigrate() {
  console.log("Running migrations...");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrate();
