const { ObjectId } = require("mongodb");
const {verifyToken} = require('../helper');

const auth = (db) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decode = verifyToken(token);
    const user = await db.collection("users").findOne({ _id: ObjectId(decode._id) });
    if (!user) return res.sendStatus(401);
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.sendStatus(403);
  }
};

module.exports = auth;
