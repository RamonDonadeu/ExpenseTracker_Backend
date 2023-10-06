const pool = require("../databaseConection").pool;

const getTokensByUserId = async (userId) => {
  try {
    const response = await pool.query(
      "SELECT * FROM tokens WHERE user_id = $1",
      [userId]
    );
    return response.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get tokens by user ID");
  }
};

const setTokens = async (user_id, tokens) => {
  try {
    const response = await pool.query(
      "INSERT INTO tokens (user_id, auth_token, refresh_token) VALUES ($1, $2, $3) RETURNING *",
      [user_id, tokens.auth_token, tokens.refresh_token]
    );
    return response.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to set tokens");
  }
};

const updateTokens = async (user_id, tokens) => {
  try {
    const response = await pool.query(
      "UPDATE tokens SET auth_token = $1, refresh_token = $2 WHERE user_id = $3 RETURNING *",
      [tokens.auth_token, tokens.refresh_token, user_id]
    );
    return response.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update tokens");
  }
};

const deleteTokens = async (user_id) => {
  try {
    const response = await pool.query("DELETE FROM tokens WHERE user_id = $1", [
      user_id,
    ]);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete tokens");
  }
};

module.exports = { getTokensByUserId, setTokens, updateTokens, deleteTokens };
