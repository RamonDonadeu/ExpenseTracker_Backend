import { describe, it, beforeEach } from "node:test";

import supertest from "supertest";
const request = supertest;
import app from "../src/index.js";
import createUser from "../src/services/userService.js";
import bcrypt from "bcrypt";
const { hash, compare } = bcrypt;
import chai from "chai";
const expect = chai.expect;
import resetDatabase from "./utils/resetDatabase.js";
import createTestUser from "./userControllerSetup/createTestUser.js";
import loginTestUser from "./userControllerSetup/loginTestUser.js";

describe("User Controller", () => {
  describe("Create Users", () => {
    beforeEach(() =>
      resetDatabase().catch((err) => console.error("beforeEach: ", err))
    );
    it("should create a new user if email and password are provided", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({ email: "test@example.com", password: "password" });
      expect(res.statusCode).to.equal(200);
    });
    it("should return 400 if email already exists", async () => {
      const existingUser = {
        email: "test@example.com",
        password: await hash("password", 10),
      };

      await createTestUser(app, existingUser);
      const res = await request(app)
        .post("/api/users")
        .send({ email: "test@example.com", password: "password" });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Email already exists");
    });
  });

  describe("Test Login", () => {
    beforeEach(async () => {
      await resetDatabase();
    });
    it("should return 400 if body is not provided", async () => {
      const res = await request(app).post("/api/users/login");
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Body is required");
    });
    it("should return 400 if email is not provided", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({ password: "password" });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Email is required");
    });
    it("should return 400 if password is not provided", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com" });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Password is required");
    });
    it("should return 401 if password is wrong", async () => {
      await createTestUser(app);
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com", password: "wrongpassword" });
      expect(res.statusCode).to.equal(401);
      expect(res.text).to.equal("Invalid credentials");
    });
    it("should return 401 if email is wrong", async () => {
      await createTestUser(app);
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "wrongtest@example.com", password: "password" });
      expect(res.statusCode).to.equal(401);
      expect(res.text).to.equal("Invalid credentials");
    });
    it("should return the user with tokens if credentials are valid", async () => {
      const testUser = {
        email: "test@example.com",
        password: "password",
      };
      await createTestUser(app, testUser);
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: testUser.email, password: testUser.password });
      expect(res.statusCode).to.equal(200);
      expect(res.body.email).to.equal(testUser.email);
      expect(await compare(testUser.password, res.body.password_hash)).to.be
        .true;
      expect(res.body.tokens.auth_token).to.exist;
      expect(res.body.tokens.refresh_token).to.exist;
    });
  });
  describe("Test Get User", () => {
    beforeEach(async () => {
      await resetDatabase();
    });
    it("Get current logged user", async () => {
      const testUser = {
        email: "test@example.com",
        password: "password",
      };
      await createTestUser(app, testUser);
      const loggedUser = await loginTestUser(app, testUser);
      // Set loggedUser.tokens.auth_token as the authorization header
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.email).to.equal(testUser.email);
    });
  });

  describe("Test Update User", () => {
    let loggedUser;

    beforeEach(async () => {
      await resetDatabase();
      const testUser = {
        email: "test@example.com",
        password: "password",
      };
      await createTestUser(app, testUser);
      loggedUser = await loginTestUser(app, testUser);
    });
    it("Update current logged user", async () => {
      // Set loggedUser.tokens.auth_token as the authorization header
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({
          id: loggedUser.id,
          full_name: "Test User",
          date_of_birth: "01/01/2000",
        });

      expect(res.statusCode).to.equal(200);
      expect(res.body.full_name).to.equal("Test User");
      expect(res.body.date_of_birth).to.equal("2000-01-01T00:00:00.000Z");
    });

    it("should return 400 if full_name is not provided", async () => {
      // Set loggedUser.tokens.auth_token as the authorization header
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({ id: loggedUser.id, date_of_birth: "01/01/2000" });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Full name is required");
    });

    it("should return 400 if date_of_birth is not provided", async () => {
      // Set loggedUser.tokens.auth_token as the authorization header
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({ id: loggedUser.id, full_name: "Test User" });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Date of birth is required");
    });

    it("should return 400 if date_of_birth format is invalid", async () => {
      // Set loggedUser.tokens.auth_token as the authorization header
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({
          id: loggedUser.id,
          full_name: "Test User",
          date_of_birth: "01-01-2000",
        });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal(
        "Date of birth format is invalid. Should be DD/MM/YYYY"
      );
    });

    // Check if date is in future
    it("should return 400 if date_of_birth is in the future", async () => {
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({
          id: loggedUser.id,
          full_name: "Test User",
          date_of_birth: "01/01/3000",
        });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Date of birth cannot be in the future");
    });
  });

  describe("Test Update User", () => {
    let loggedUser;

    beforeEach(async () => {
      await resetDatabase();
      const testUser = {
        email: "test@example.com",
        password: "password",
      };
      await createTestUser(app, testUser);
      loggedUser = await loginTestUser(app, testUser);
    });
    it("Update current logged user", async () => {
      // Set loggedUser.tokens.auth_token as the authorization header
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({
          id: loggedUser.id,
          full_name: "Test User",
          date_of_birth: "01/01/2000",
        });

      expect(res.statusCode).to.equal(200);
      expect(res.body.full_name).to.equal("Test User");
      expect(res.body.date_of_birth).to.equal("2000-01-01T00:00:00.000Z");
    });

    it("should return 400 if full_name is not provided", async () => {
      // Set loggedUser.tokens.auth_token as the authorization header
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({ id: loggedUser.id, date_of_birth: "01/01/2000" });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Full name is required");
    });

    it("should return 400 if date_of_birth is not provided", async () => {
      // Set loggedUser.tokens.auth_token as the authorization header
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({ id: loggedUser.id, full_name: "Test User" });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Date of birth is required");
    });

    it("should return 400 if date_of_birth format is invalid", async () => {
      // Set loggedUser.tokens.auth_token as the authorization header
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({
          id: loggedUser.id,
          full_name: "Test User",
          date_of_birth: "01-01-2000",
        });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal(
        "Date of birth format is invalid. Should be DD/MM/YYYY"
      );
    });

    // Check if date is in future
    it("should return 400 if date_of_birth is in the future", async () => {
      const res = await request(app)
        .put("/api/users")
        .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
        .send({
          id: loggedUser.id,
          full_name: "Test User",
          date_of_birth: "01/01/3000",
        });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Date of birth cannot be in the future");
    });
  });
});
import tokensService from "../src/services/tokensService.js";

describe("Refresh Token", () => {
  let loggedUser;

  beforeEach(async () => {
    await resetDatabase();
    const testUser = {
      email: "test@example.com",
      password: "password",
    };
    await createTestUser(app, testUser);
    loggedUser = await loginTestUser(app, testUser);
  });

  it("should return 400 if auth_token is not provided", async () => {
    const res = await request(app)
      .post("/api/users/refreshToken")
      .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
      .send({ refresh_token: "test_refresh_token" });
    expect(res.statusCode).to.equal(400);
    expect(res.text).to.equal("Access token is required");
  });

  it("should return 400 if refresh_token is not provided", async () => {
    const res = await request(app)
      .post("/api/users/refreshToken")
      .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`)
      .send({ auth_token: "test_auth_token" });
    expect(res.statusCode).to.equal(400);
    expect(res.text).to.equal("Refresh token is required");
  });

  it("should return 401 if access token is invalid", async () => {
    const res = await request(app)
      .post("/api/users/refreshToken")
      .send({
        auth_token: "invalid_token",
        refresh_token: loggedUser.tokens.refresh_token,
      })
      .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`);

    expect(res.statusCode).to.equal(401);
    expect(res.text).to.equal("Invalid access token");
  });

  it("should return 401 if refresh token is invalid", async () => {
    const res = await request(app)
      .post("/api/users/refreshToken")
      .send({
        auth_token: loggedUser.tokens.auth_token,
        refresh_token: "invalid_token",
      })
      .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`);

    expect(res.statusCode).to.equal(401);
    expect(res.text).to.equal("Invalid refresh token");
  });

  it("should return new tokens if both tokens are valid", async () => {
    const res = await request(app)
      .post("/api/users/refreshToken")
      .send({
        auth_token: loggedUser.tokens.auth_token,
        refresh_token: loggedUser.tokens.refresh_token,
      })
      .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.tokens.auth_token).to.exist;
    expect(res.body.tokens.refresh_token).to.exist;
    expect(res.body.tokens.auth_token).to.not.equal(
      loggedUser.tokens.auth_token
    );
    expect(res.body.tokens.refresh_token).to.not.equal(
      loggedUser.tokens.refresh_token
    );
  });

  it("Should delete tokens if a token is invalid", async () => {
    const res = await request(app)
      .post("/api/users/refreshToken")
      .send({
        auth_token: "invalid_token",
        refresh_token: loggedUser.tokens.refresh_token,
      })
      .set("Authorization", `Bearer ${loggedUser.tokens.auth_token}`);

    expect(res.statusCode).to.equal(401);
    expect(res.text).to.equal("Invalid access token");

    const tokens = await tokensService.getTokensByUserId(loggedUser.id);
    expect(tokens).to.be.undefined;
  });
});
