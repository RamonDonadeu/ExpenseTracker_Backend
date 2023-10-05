const userServices = require("../services/userService");
const checkCredentials = require("../utils/checkCredentials");
const bcrypt = require("bcrypt");
const generateAccessToken = require("../utils/generateAccessToken");
const generateRefreshToken = require("../utils/generateRefreshToken");

const getUser = async (req, res) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded);
  if (!id) res.status(400).send("Id is required");
  const user = await userServices.getUser(id);
  if (!user) res.status(404).send("User not found");

  res.json(user);
};

const createUser = async (req, res) => {
  const { body } = req;
  if (!body) res.status(400).send("Body is required");
  // Check if body has email and password
  if (!body.email) res.status(400).send("Email is required");
  if (!body.password) res.status(400).send("Password is required");
  // Check if email already exists
  const user = await userServices.getUserByEmail(body.email);
  if (user) res.status(400).send("Email already exists");

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(body.password, saltRounds);

  const newUser = {
    email: body.email,
    password: hashedPassword,
  };
  const createdUser = await userServices.createUser(newUser);
  res.json(createdUser);
};

const updateUser = async (req, res) => {
  const updatedUser = await userServices.updateUser(req.body);
  res.json(updatedUser);
};

const login = async (req, res) => {
  const { body } = req;
  if (!body) res.status(400).send("Body is required");
  if (!body.email) res.status(400).send("Email is required");
  if (!body.password) res.status(400).send("Password is required");

  const loggedUser = await checkCredentials(req.body);
  if (!loggedUser) {
    res.status(401).send("Invalid credentials");
    return;
  }

  // Generate access token and update user
  const auth_token = await generateAccessToken(loggedUser);
  const refresh_token = await generateRefreshToken(loggedUser);
  loggedUser.auth_token = auth_token;
  loggedUser.refresh_token = refresh_token;
  await userServices.updateTokens(loggedUser);
  const updatedUser = await userServices.updateUser(loggedUser);
  

  res.json(updatedUser);
};

module.exports = { getUser, createUser, updateUser, login };
