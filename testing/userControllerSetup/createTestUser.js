// Create a test user for the user controller tests
import request from "supertest";
import bcrypt from "bcrypt";

const createTestUser = async (app, testUser) => {
  // Send a request to post /api/user with thestUser
  const res = await request(app).post("/api/users").send(testUser);
};

export default createTestUser;
