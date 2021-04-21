const {verifyToken} = require('../helper');
const { ObjectId } = require("mongodb");

const auth = (db) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = verifyToken(token);
    console.log(decoded)
    const user = await db.collection("users").findOne({ _id: ObjectId(decoded._id) });
    if (!user) return res.sendStatus(401);
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
      res.status(403).send({message: error.message});
  }
};

module.exports = auth;
