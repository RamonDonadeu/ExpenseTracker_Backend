import environments from "../config/config.js";
const environment = process.env.NODE_ENV || "development";
const envConfig = environments[environment];

import pg from "pg";
const { Pool } = pg;
const pool = new Pool({
  user: envConfig.database.username,
  host: envConfig.database.host,
  database: envConfig.database.database,
  password: envConfig.database.password,
  port: envConfig.database.port,
});

export default pool;
