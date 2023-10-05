const jwt = require("jsonwebtoken");
const generateAccessToken = require("../utils/generateAccessToken");
const generateRefreshToken = require("../utils/generateRefreshToken");

const verifyToken = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) res.status(401).send("Token not found");
  token = token.split("Bearer ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded;
    next();
  } catch (error) {
    console.log("error", error);
    res.status(401).send("Invalid token");
  }
};

module.exports = verifyToken;
