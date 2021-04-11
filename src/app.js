const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const createUser = (user, db) => {
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

const handleRequest = (db) => async (req, res) => {
  const user = req.body;
  try {
    const errors = validateUser(user);
    if (errors.length > 0) return res.status(400).send({ errors });
    user.password = await bcrypt.hash(user.password, 8);
    const results = await createUser(
      { ...user, isEmailVerified: false, created_at: new Date() },
      db
    );
    res.status(201).send(results);
  } catch (error) {
    if (error.code === 11000)
      res.status(400).send({ message: "duplicate email." });
    else res.status(500).send(error.message);
  }
};

app.setupRoutes = (db) => {
  app.post("/users", handleRequest(db));
};

function isEmail(email) {
  return email.match(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  );
}

function isPassword(pass) {
  return pass.match(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/
  );
}

function validateUser(user) {
  const errors = "";
  if (!user.name) errors.concat(", ", "Name is required");
  if (!user.email) errors.concat(", ", "Email is required");
  else if (!isEmail(user.email)) errors.push("Wrong email format");
  if (!user.password) errors.concat(", ", "Password is required");
  else if (!isPassword(user.password)) {
    errors.concat(", ", "Wrong password format");
  }
  return errors;
}

module.exports = app;
