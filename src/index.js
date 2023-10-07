import express, { json } from "express";
import { env } from "process";
import userRouter from "./routes/userRoutes.js";
import verifyToken from "./middleware/verifyToken.js";

const app = express();
const PORT = env.PORT || 3000;

import dotenv from "dotenv";
dotenv.config();

// Middleware

// Middleware function to parse incoming requests with JSON payloads
app.use(json());

// Middleware function to log incoming requests
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

// Register middleware function for all incoming requests

if (env.NODE_ENV === "dev") {
  app.use(logger);
}

// Check the acces token except if url is /users

app.use(async (req, res, next) => {
  if (
    (req.url === "/api/users" ||
      req.url === "/api/users/login" ||
      req.url === "/api/users/refreshToken") &&
    req.method === "POST"
  ) {
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

export default app;
