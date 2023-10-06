const request = require("supertest");

const loginTestUser = async (app, testUser) => {
  const res = await request(app).post("/api/users/login").send(testUser);
  return res.body;
};

module.exports = { loginTestUser };
