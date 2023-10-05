const express = require("express");
const process = require("process");
const userRouter = require("./routes/userRoutes.js");
const verifyToken = require("./middleware/verifyToken.js");

const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();

// Middleware

// Middleware function to parse incoming requests with JSON payloads
app.use(express.json());

// Middleware function to log incoming requests
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

// Register middleware function for all incoming requests
app.use(logger);

// Check the acces token except if url is /users

app.use(async (req, res, next) => {
  if ((req.url === "/api/users" || req.url === "/api/users/login") && req.method === "POST") {
    next();
  } else {
    await verifyToken(req, res, next);
  }
});

// Routes

app.use("/api/users", userRouter);

// Server

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
