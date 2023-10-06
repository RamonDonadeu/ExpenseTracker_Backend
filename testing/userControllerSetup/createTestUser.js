// Create a test user for the user controller tests
const request = require("supertest");
const bcrypt = require("bcrypt");

const createTestUser = async (app, testUser) => {
  // Send a request to post /api/user with thestUser
  const res = await request(app).post("/api/users").send(testUser);
};

module.exports = { createTestUser };
