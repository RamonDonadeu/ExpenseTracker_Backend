const userServices = require("../services/userService");
const checkCredentials = require("../utils/checkCredentials");
const bcrypt = require("bcrypt");
const generateAccessToken = require("../utils/generateAccessToken");
const generateRefreshToken = require("../utils/generateRefreshToken");
const jwt = require("jsonwebtoken");
const tokensService = require("../services/tokensService");

const getUser = async (req, res) => {
  let token = req.headers.authorization.split("Bearer ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET).user;

  const id = decoded.id;
  if (!id) return res.status(400).send("Id is required");
  const user = await userServices.getUser(id);
  const tokens = await tokensService.getTokensByUserId(id);
  user.tokens = tokens;
  if (!user) return res.status(404).send("User not found");

  res.json(user);
};

const createUser = async (req, res) => {
  const { body } = req;
  if (!body) return res.status(400).send("Body is required");
  // Check if body has email and password
  if (!body.email) return res.status(400).send("Email is required");
  if (!body.password) return res.status(400).send("Password is required");
  // Check if email already exists
  const user = await userServices.getUserByEmail(body.email);
  if (user) return res.status(400).send("Email already exists");

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
  const { body } = req;
  if (!body) return res.status(400).send("Body is required");
  // Check if body has id
  if (!body.id) return res.status(400).send("Id is required");
  // Check if user exists
  const user = await userServices.getUser(body.id);
  if (!user) return res.status(404).send("User not found");
  // Check if body has full_name and date_of_birth
  if (!body.full_name) return res.status(400).send("Full name is required");
  if (!body.date_of_birth)
    return res.status(400).send("Date of birth is required");
  //Check date of birth format
  const dateOfBirthRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateOfBirthRegex.test(body.date_of_birth))
    return res
      .status(400)
      .send("Date of birth format is invalid. Should be DD/MM/YYYY");
  // Format date of birth to POSTGRES Date format from DD/MM/YYYY
  const [day, month, year] = body.date_of_birth.split("/");
  const dateOfBirth = new Date(`${year}-${month}-${day}`);
  // Check if date is valid
  if (isNaN(dateOfBirth.getTime()))
    return res.status(400).send("Date of birth is invalid");

  const userToUpdate = { ...body, date_of_birth: dateOfBirth };

  const updatedUser = await userServices.updateUser(userToUpdate);
  res.json(updatedUser);
};

const login = async (req, res) => {
  const { body } = req;
  if (!body || Object.keys(body).length === 0) return res.status(400).send("Body is required");
  if (!body.email) return res.status(400).send("Email is required");
  if (!body.password) return res.status(400).send("Password is required");

  const loggedUser = await checkCredentials(req.body);
  if (!loggedUser) {
    return res.status(401).send("Invalid credentials");
  }

  // Generate access token and update user
  const auth_token = await generateAccessToken(loggedUser);
  const refresh_token = await generateRefreshToken(loggedUser);
  const tokens = { auth_token, refresh_token };

  // If user has tokens update the tokens, else insert new tokens
  const userTokens = await tokensService.getTokensByUserId(loggedUser.id);
  if (userTokens) await tokensService.updateTokens(loggedUser.id, tokens);
  else await tokensService.setTokens(loggedUser.id, tokens);

  const updatedUser = await userServices.updateUser(loggedUser);

  updatedUser.tokens = tokens;

  res.json(updatedUser);
};

// Import necessary modules
const refreshToken = async (req, res) => {
  const { body } = req;
  if (!body) return res.status(400).send("Body is required");
  const bearerToken = req.headers.authorization.split("Bearer ")[1];

  const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
  const user = decoded.user;

  // Check that access token is the same as the one stored in the database
  if (!body.auth_token) return res.status(400).send("Access token is required");
  const oldTokens = await tokensService.getTokensByUserId(user.id);
  if (!oldTokens) return res.status(401).send("Invalid access token");
  if (oldTokens.auth_token !== body.auth_token) {
    tokensService.deleteTokens(user.id);
    return res.status(401).send("Invalid access token");
  }

  // Check that refresh token is provided and is the same as the one stored in database
  if (!body.refresh_token)
    return res.status(400).send("Refresh token is required");
  if (oldTokens.refresh_token !== body.refresh_token) {
    tokensService.deleteTokens(user.id);
    return res.status(401).send("Invalid refresh token");
  }

  // Verify the refresh token and get the user
  const { refresh_token } = body;
  if (!user) return res.status(401).send("Invalid refresh token");

  // Check that the user has valid tokens
  const userTokens = await tokensService.getTokensByUserId(user.id);
  if (!userTokens) return res.status(401).send("Invalid refresh token");

  // Generate new access and refresh tokens
  const newAccessToken = await generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user);
  const tokens = { auth_token: newAccessToken, refresh_token: newRefreshToken };

  // Update the user's tokens in the database
  await tokensService.updateTokens(user.id, tokens);

  // Update the user's tokens in the user object
  const updatedUser = await userServices.updateUser(user);
  updatedUser.tokens = tokens;

  // Send the updated user object as response
  res.json(updatedUser);
};

module.exports = { getUser, createUser, updateUser, login, refreshToken };
