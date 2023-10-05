const jwt = require("jsonwebtoken");
const generateAccessToken = async (user) => {
    return jwt.sign({user}, process.env.JWT_SECRET, { expiresIn: "15m" });
}

module.exports = generateAccessToken;
