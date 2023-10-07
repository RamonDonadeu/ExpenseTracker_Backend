import jwt from "jsonwebtoken";
const { sign } = jwt;
const generateAccessToken = async (user) => {
  return sign({ user }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

export default generateAccessToken;
