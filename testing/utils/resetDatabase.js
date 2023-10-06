// setupTests.js

const fs = require("fs").promises;
const path = require("path");
const { pool } = require("../../src/databaseConection");

async function resetDatabase() {
  const initSqlPath = path.join(__dirname, "./init.sql");
  const initSql = await fs.readFile(initSqlPath, "utf8");

  await pool.connect();
  await pool.query(initSql);
}

module.exports = { resetDatabase };
