const getUserByEmail = require("../services/userService").getUserByEmail;
const bcrypt = require("bcrypt");

const checkCredentials = async (body) => {
  const { email, password } = body;
  const user = await getUserByEmail(email);
  if (!user) return null;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password_hash, function (err, result) {
      if (err) {
        // Handle error
        console.error(err);
        reject(err);
      } else {
        if (result) {
          resolve(user);
        } else {
          console.log("Passwords don't match");
          resolve(false);
        }
      }
    });
  });
};

module.exports = checkCredentials;
