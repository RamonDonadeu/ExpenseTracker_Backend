const request = require("supertest");
const { app } = require("../src/index");
const userServices = require("../src/services/userService.js");
const bcrypt = require("bcrypt");
const { expect } = require("chai");
const { resetDatabase } = require("./utils/resetDatabase.js");
const { createTestUser } = require("./userControllerSetup/createTestUser");
const { login } = require("../src/controllers/userController");
const { loginTestUser } = require("./userControllerSetup/loginTestUser");
describe("User Controller", () => {
  describe("Create Users", () => {
    beforeEach(async () => {
      await resetDatabase();
    });
    it("should create a new user if email and password are provided", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({ email: "test@example.com", password: "password" });
      expect(res.statusCode).to.equal(200);
    });

    it("should return 400 if email already exists", async () => {
      const existingUser = {
        email: "test@example.com",
        password: await bcrypt.hash("password", 10),
      };
      await userServices.createUser(existingUser);
      const res = await request(app)
        .post("/api/users")
        .send({ email: "test@example.com", password: "password" });
      expect(res.statusCode).to.equal(400);
      expect(res.text).to.equal("Email already exists");
    });
  });
});

// Tests for /api/users/login
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
      .send({ email: "wrong@example.com", password: "password" });
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
    expect(await bcrypt.compare(testUser.password, res.body.password_hash)).to
      .be.true;
    expect(res.body.tokens.auth_token).to.exist;
    expect(res.body.tokens.refresh_token).to.exist;
  });
});

describe("getUser", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  it("Get current logged user", async () => {
    const testUser = {
      email: "test@example.com",
      password: "password"
    }
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
