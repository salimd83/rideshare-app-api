const jwt = require("jsonwebtoken");

const signToken = (id, exp = "1h") => {
  return jwt.sign({ _id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: exp,
  });
};

const verifyToken = (token) => {
  const d = jwt.verify(token, process.env.JWT_SECRET);
  if (Date.now() >= d.exp * 1000) throw new Error();
  return d;
};

module.exports = {
  signToken,
  verifyToken,
};
