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
  res.render("login");
});

router.post("/", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.render("login", { alerts: [String(err)] });
    }

    if (!user) {
      console.log(info);
      return res.render("login", { alerts: ["Invalid e-mail or password."] });
    }

    req.logIn(user, function (err) {
      if (err) {
        return res.render("login", { alerts: [String(err)] });
      }
      console.log("Authenticated " + String(user));
      jwt.sign(
        { _id: req.user._id, level: req.user.level },
        "learnvault2023",
        { expiresIn: "3h" },
        function (e, token) {
          if (e) res.render("login", { alerts: [String(err)] });
          else
            res
              .cookie("access_token_learnvault", token)
              .status(200)
              .redirect("/");
        }
      );
      userController.updateLastActiveAt(user);
    });
  })(req, res, next);
});

module.exports = router;
