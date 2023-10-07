import jwt from "jsonwebtoken";
const { verify } = jwt;
import tokensService from "../services/tokensService.js";

const verifyToken = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) res.status(401).send("Token not found");
  token = token.split("Bearer ")[1];
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    // Check auth token is the same in DB
    const tokens = await tokensService.getTokensByUserId(decoded.user.id);
    if (tokens === undefined || tokens.auth_token !== token) {
      throw new Error("Invalid token");
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log("error", error);
    res.status(401).send("Invalid token");
  }
};

export default verifyToken;
