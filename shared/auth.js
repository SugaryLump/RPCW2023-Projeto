var jwt = require("jsonwebtoken");
var userController = require("../controllers/user");
var resourceController = require("../controllers/resource");

module.exports.isAdmin = function (req, res, next) {
  var tok = req.cookies.access_token_learnvault;
  if (tok) {
    jwt.verify(tok, "learnvault2023", async function (err, payload) {
      if (payload) {
        req.user = await userController.get(payload._id)
        if (req.user.level == 'admin') {
          next();
        }
      }
    });
  }
  next("route");
};

module.exports.isLogged = function (req, res, next) {
  var tok = req.cookies.access_token_learnvault;
  if (tok) {
    jwt.verify(tok, "learnvault2023", async function (err, payload) {
      if (payload) {
        req.user = await userController.get(payload._id)
        next();
      }
    });
  }
  next("route");
};

// Route must use resourceID parameter in URL!!
module.exports.isPoster = function(req, res, next) {
  var tok = req.cookies.access_token_learnvault;
  if (tok) {
    jwt.verify(tok, "learnvault2023", async function(err, payload) {
      if (payload) {
        req.user = await userController.get(payload._id)
        if (req.user._id == req.params.resourceID) {
          next();
        }
      }
    })
  }
  next("route")
}