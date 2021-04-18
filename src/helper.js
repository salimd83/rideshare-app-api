const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (Date.now() >= decoded.exp * 1000) throw new Error();
  return decoded;
};

const signToken = (id, exp = "1h") => {
  return jwt.sign({ _id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: exp,
  });
};

module.exports = {
  verifyToken,
  signToken
};
