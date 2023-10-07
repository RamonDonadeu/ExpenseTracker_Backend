import jwt from "jsonwebtoken";
const { sign } = jwt;

const generateRefreshToken = async (user) => {
  return sign({ user }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export default generateRefreshToken;
