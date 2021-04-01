require("dotenv").config();
const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");

const port = process.env.PORT;
const dbURL = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB_NAME;

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(dbURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

let db;

async function runConnect() {
  try {
    await client.connect();
    db = client.db(dbName);
    const users = db.collection("users");
    users.createIndex({ email: 1 }, { unique: 1 });

    console.log("The database is connected");
  } catch (error) {
    console.error("Couldn't connect to database.");
    console.log(error);
  }
}

runConnect();

const handleNewUser = (user) => {
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

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
  if (!user.firstName) errors.push("Firstname is required");
  if (!user.lastName) errors.push("Lastname is required");
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

app.post("/users", async (req, res) => {
  const user = req.body;
  try {
      if(validateUser(user).length > 0) throw new Error("validation error.");
      const results = await handleNewUser(user);
      res.send(results);
  } catch (error) {
    if (error.message.startsWith("E11000 duplicate"))
      res.status(500).send("duplicate email.");
    else res.status(500).send(error.message);
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
