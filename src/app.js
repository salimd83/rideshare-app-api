const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Joi = require("joi");
const { ObjectId } = require("mongodb");
const auth = require("./middleware/auth");
const {signToken, verifyToken} = require('./helper');

const emailConfig = {
  service: "gmail",
  auth: {
    user: "salimdirani@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
};
const transporter = nodemailer.createTransport(emailConfig);
const baseUrl = process.env.BASE_URL;

const app = express();
app.use(cors());
app.use(express.json());

const sendEmailVerification = async (user, token, redirect) => {
  var mailOptions = {
    from: "salimdirani@gmail.com",
    to: user.email,
    subject: "Rideashare account: email verification",
    html: `
          Dear ${user.name} <br /><br />
          Thank you for registering with Rideshare app. <br />
          To complete registration you need to click the link below to verify your account:
          <br />
          <a href="${baseUrl}/users/verification?t=${token}&r=${redirect}">
            ${baseUrl}/users/verification?t=${token}&r=${redirect}
          </a>
          <br />
          <br />
          Sincerly,<br />
          Rideshare Admin
        `,
  };
  return await transporter.sendMail(mailOptions);
};

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

const getUserByEmail = async (email, db) => {
  const users = db.collection("users");
  return await users.findOne({ email });
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
      { ...value, isEmailVerified: false, createdAt: new Date() },
      db
    );
    const token = signToken(results);
    res.status(201).send({ token });
  } catch (error) {
    if (error.code === 11000)
      res.status(400).send({ message: "duplicate email." });
    else res.status(500).send(error.message);
  }
};

const loginRequestHandler = (db) => async (req, res) => {
  const { email, password } = req.body;
  const message = "Wrong email/password combination";

  if (!email || !password)
    return res.status(400).send({ message: "validation error" });
  const user = await getUserByEmail(email, db);
  if (!user) return res.status(401).send({ message });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send({ message });

  const token = signToken(user._id, req.body.remember ? "7d" : "1h");

  res.send({
    user: {
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
    token,
  });
};

const handleSendVerificationRequest = async (req, res) => {
  if (req.user.isEmailVerified)
    return res.send({ message: "email already verified" });
  try {
    const token = signToken(req.user._id, "15m");
    await sendEmailVerification(req.user, token, req.body.redirect);
    res.send();
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const handleVerificationRequest = (db) => async (req, res) => {
  const users = db.collection("users");

  try {
    const decoded = verifyToken(req.query.t);
    const user = await users.findOne({
      _id: ObjectId(decoded._id),
    });
    if (!user) return res.sendStatus(401);
    if (user.isEmailVerified)
      return res.send({ message: "email already verified" });

    await users.updateOne(
      { _id: user._id },
      { $set: { isEmailVerified: true } }
    );

    res.redirect(req.query.r);
  } catch (error) {
    console.log(error)
    res.status(403).send({ message: error.message });
  }
};

app.setupRoutes = (db) => {
  app.post("/users", requestHandler(db));
  app.post("/users/login", loginRequestHandler(db));
  app.post("/users/verification", auth(db), handleSendVerificationRequest);
  app.get("/users/verification", handleVerificationRequest(db));
};

module.exports = app;
