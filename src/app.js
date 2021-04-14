const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const Joi = require("joi");

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

const schema = Joi.object({
  name: Joi.string().min(4).required(),
  email: Joi.string().email(),
  password: Joi.string().pattern(
    new RegExp(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/
    )
  ),
});

const requestHandler = (db) => async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { value, error } = schema.validate({ name, email, password });

    if (error) return res.status(400).send({ error });

    value.password = await bcrypt.hash(value.password, 8);

    const results = await createUser(
      { ...value, isEmailVerified: false, created_at: new Date() },
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
  app.post("/users", requestHandler(db));
};

module.exports = app;
