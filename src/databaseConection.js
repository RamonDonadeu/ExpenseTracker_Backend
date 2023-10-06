const config = require("../config/config.js");
const environment = process.env.NODE_ENV || "development";
const envConfig = config.environments[environment];

const { Pool } = require("pg");
const pool = new Pool({
  user: envConfig.database.username,
  host: envConfig.database.host,
  database: envConfig.database.database,
  password: envConfig.database.password,
  port: envConfig.database.port,
});

module.exports = { pool };
