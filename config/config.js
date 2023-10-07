// config/config.js
const development = {
  database: {
    host: "localhost",
    username: "myuser",
    password: "mypassword",
    database: "mydb",
    port: 5433,
  },
  logLevel: "debug",
};
const test = {
  database: {
    host: "localhost",
    username: "myuser",
    password: "mypassword",
    database: "testdb",
    port: 5434,
  },
  logLevel: "silent",
};
const production = {
  database: {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  logLevel: "info",
};
const environments = { production, test, development };
export default environments;
