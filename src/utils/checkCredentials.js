import userService from "../services/userService.js";
import { compare } from "bcrypt";

const checkCredentials = async (body) => {
  const { email, password } = body;
  const user = await userService.getUserByEmail(email);
  if (!user) return null;
  return new Promise((resolve, reject) => {
    compare(password, user.password_hash, function (err, result) {
      if (err) {
        // Handle error
        console.error(err);
        reject(err);
      } else {
        if (result) {
          resolve(user);
        } else {
          resolve(false);
        }
      }
    });
  });
};

export default checkCredentials;
