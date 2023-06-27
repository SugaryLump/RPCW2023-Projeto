var jwt = require("jsonwebtoken");
var userController = require("../controllers/user");

module.exports.isAdmin = function (req, res, next) {
  var tok = req.cookies.access_token_learnvault;
  if (tok) {
    jwt.verify(tok, "learnvault2023", async function (err, payload) {
      if (payload && (await userController.isAdmin(payload._id))) {
        next();
      } else {
        next("route");
      }
    });
  } else {
    next("route");
  }
};

module.exports.isLogged = function (req, res, next) {
  var tok = req.cookies.access_token_learnvault;
  if (tok) {
    jwt.verify(tok, "learnvault2023", function (err, payload) {
      if (err) {
        next("route");
      } else {
        next();
      }
    });
  } else {
    next("route");
  }
};
