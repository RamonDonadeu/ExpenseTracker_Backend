const jwt = require("jsonwebtoken");

const generateRefreshToken = async (user) => {
  return jwt.sign({ user }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateRefreshToken;
