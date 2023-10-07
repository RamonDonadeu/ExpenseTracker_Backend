import request from "supertest";

const loginTestUser = async (app, testUser) => {
  const res = await request(app).post("/api/users/login").send(testUser);
  return res.body;
};

export default loginTestUser;
