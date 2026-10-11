import fs from "fs/promises";
import { pool } from "../pool/pool.js";

await pool.query(`
  CREATE TABLE IF NOT EXISTS migrations (
  filename TEXT PRIMARY KEY,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

  )
  `);

const file = await fs.readdir("src/database/migrations");

const sqlFiles = file.filter((file) => file.endsWith(".sql"));

for (const file of sqlFiles) {
  const alreadyRan = await pool.query(
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

  const sql = await fs.readFile(`src/database/migrations/${file}`, "utf-8");

  await pool.query(sql);

  await pool.query(
    `
    INSERT INTO migrations (filename)
    VALUE ($1)
    `,
    [file],
  );
  console.log(`Migrating: ${file}`);
  
  await pool.end();
  console.log(`Migration has been completed`);
}

// await pool.query(`
//   CREATE TABLE IF NOT EXISTS migrations (
//     filename TEXT PRIMARY KEY,
//     ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
//   )
// `);

// console.log("Migrations table checked/created");

// const file = await fs.readdir("src/database/migrations");

// const sqlFiles = file.filter((file) => file.endsWith(".sql")).sort();
// for (const file of sqlFiles) {
//   const alreadyRan = await pool.query(
//     `
//     SELECT filename
//     FROM migrations
//     WHERE filename = $1
//     `,
//     [file],
//   );
//   if (alreadyRan.rows.length > 0) {
//     console.log(`skipping: ${file}`);
//     continue;
//   }

//   const sql = await fs.readFile(`src/database/migrations/${file}`, "utf-8");

//   await pool.query(sql);

//   await pool.query(
//     `
//   INSERT INTO migrations (filename)
//   VALUES ($1)
//   `,
//     [file],
//   );

//   console.log(`Migrated: ${file}`);
// }

// await pool.end();

// console.log("Migration completed");
