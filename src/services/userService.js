import pool from "../databaseConection.js";

const getUser = async (userId) => {
  try {
    const response = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    return response.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user by ID");
  }
};

const getUserByEmail = async (email) => {
  try {
    const response = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return response.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user by email");
  }
};

const createUser = async (user) => {
  try {
    const response = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
      [user.email, user.password]
    );

    delete response.rows[0].password_hash;
    return response.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create user");
  }
};

const updateUser = async (user) => {
  try {
    const response = await pool.query(
      "UPDATE users SET full_name = $1, date_of_birth = $2 WHERE id = $3 RETURNING *",
      [user.full_name, user.date_of_birth, user.id]
    );

    return response.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update user");
  }
};

export default {
  getUser,
  createUser,
  updateUser,
  getUserByEmail,
};
