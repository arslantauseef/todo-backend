import fs from "fs/promises";
import { pool } from "../pool/pool.js";

const client = await pool.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      filename TEXT PRIMARY KEY,
      ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const files = await fs.readdir("src/database/migrations");

  const sqlFiles = files
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of sqlFiles) {
    const alreadyRan = await client.query(
      `
        SELECT filename
        FROM migrations
        WHERE filename = $1
      `,
      [file],
    );

    if (alreadyRan.rows.length > 0) {
      console.log(`Skipping: ${file}`);
      continue;
    }

    const sql = await fs.readFile(
      `src/database/migrations/${file}`,
      "utf-8",
    );

    try {
      await client.query("BEGIN");

      await client.query(sql);

      await client.query(
        `
          INSERT INTO migrations (filename)
          VALUES ($1)
        `,
        [file],
      );

      await client.query("COMMIT");

      console.log(`Migrated: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(`Migration failed: ${file}`);
      throw error;
    }
  }
} finally {
  client.release();
  await pool.end();
}

console.log("Migration completed");