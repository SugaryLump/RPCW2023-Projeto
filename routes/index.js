var express = require("express");
var router = express.Router();
var userController = require("../controllers/user");
var userModel = require("../models/user");
var passport = require("passport");
var jwt = require("jsonwebtoken");
var auth = require("../shared/auth");

router.get("/", function (req, res, next) {
  res.redirect("/resources");
});

router.get("/logout", auth.isLogged, function (req, res, next) {
  req.session.destroy(function () {
    res.clearCookie("access_token_learnvault");
    res.redirect("/");
  });
});

router.get("/logout", function (req, res, next) {
  res.redirect("/");
});

module.exports = router;
