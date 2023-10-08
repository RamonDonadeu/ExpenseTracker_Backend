//Get user id from jwt token

const getUserIdFromToken = (req) => {
  let token = req.headers.authorization.split("Bearer ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.user.id;
};

export default getUserIdFromToken;
