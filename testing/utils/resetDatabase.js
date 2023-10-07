// setupTests.js

import { promises as fs } from "fs";
import { join } from "path";
import pool from "../../src/databaseConection.js";

async function resetDatabase() {
  const initSqlPath = join(process.cwd(), "testing", "utils", "init.sql");
  const initSql = await fs.readFile(initSqlPath, "utf8");
  pool.pool;
  await pool.connect();
  await pool.query(initSql);
}

export default resetDatabase;
