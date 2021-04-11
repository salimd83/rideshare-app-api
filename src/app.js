const express = require("express");
const cors = require("cors");
const ValidationError = require("./errors/ValidationError");

const app = express();
app.use(cors());
app.use(express.json());

const handleNewUser = (user, db) => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = db.collection("users");
      const results = await users.insertOne(user);
      resolve(results.insertedId);
    } catch (error) {
      reject(error);
    }
  });
};

function isEmail(email) {
  const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return email.match(mailformat);
}

function isPassword(pass) {
  const passformat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
  return pass.match(passformat);
}

function validateUser(user) {
  const errors = [];
  if (!user.name) errors.push("Firstname is required");
  if (!user.email) {
    errors.push("Email is required");
  } else {
    if (!isEmail(user.email)) errors.push("Wrong email format.");
  }
  if (!user.password) {
    errors.push("Password is required");
  } else {
    if (!isPassword(user.password))
      errors.push(
        "Wrong password format it must be between 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character."
      );
  }
  return errors;
}

app.setupRoutes = (db) => {
  app.post("/users", async (req, res) => {
    const user = req.body;
    try {
      const errors = validateUser(user);
      if (errors.length > 0)
        throw new ValidationError(errors, "Validation Error");
      const results = await handleNewUser(user, db);
      res.status(201).send(results);
    } catch (error) {
      console.log(error)
      if (error instanceof ValidationError)
        res.status(400).send({ message: error.message, errors: error.errors });
      else if (error.message.startsWith("E11000 duplicate"))
        res.status(400).send({ message: "duplicate email." });
      else res.status(500).send(error.message);
    }
  });
};

module.exports = app;
