const SECRET_KEY = "This is secret Key asdfg";
const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  let token = req.headers.authorization;
  // console.log(token)
  try {
    var decoded = jwt.verify(token, SECRET_KEY);
    req.userData = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Auth failed...",
    });
  }
};

module.exports = checkAuth;
