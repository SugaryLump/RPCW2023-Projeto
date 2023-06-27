var express = require("express");
var router = express.Router();
var userController = require("../controllers/user");
var userModel = require("../models/user");
var passport = require("passport");
var jwt = require("jsonwebtoken");
var auth = require("../shared/auth");

router.all("/", auth.isLogged, function (req, res, next) {
  res.redirect("/");
});

router.get("/", function (req, res, next) {
  res.render("register");
});

router.post("/", function (req, res, next) {
  userModel.register(
    new userModel({
      email: req.body.email,
      name: req.body.name,
      affiliation: req.body.affiliation,
    }),
    req.body.password,
    function (err, user) {
      if (err)
        res.render("register", {
          alerts: [
            "Bad register with " +
              req.body.email +
              " " +
              req.body.name +
              ": " +
              String(err),
          ],
        });
      else {
        passport.authenticate("local", (err, user, info) => {
          req.logIn(user, function (err) {
            console.log("Authenticated " + String(user));
            jwt.sign(
              { _id: req.user._id, level: req.user.level },
              "learnvault2023",
              { expiresIn: 3600 },
              function (e, token) {
                res
                  .cookie("access_token_learnvault", token)
                  .status(200)
                  .redirect("/");
              }
            );
          });
        })(req, res, next);
      }
    }
  );
});

module.exports = router;
