var express = require("express");
var router = express.Router();
var userController = require("../controllers/user");
var userModel = require("../models/user");
var passport = require("passport");
var jwt = require("jsonwebtoken");
var auth = require("../shared/auth");

router.all("/", auth.isLogged, function (req, res, next) {
  if (req.params.redirect) {
    res.redirect(req.params.redirect);
  }
  else {
    res.redirect("/");
  }
});

router.get("/", function (req, res, next) {
  res.render("login", {redirect:req.query.redirect});
});

router.post("/", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.render("login", { alerts: [String(err)], redirect:req.query.redirect });
    }

    if (!user) {
      console.log(info);
      return res.render("login", { alerts: ["Invalid e-mail or password."], redirect:req.query.redirect });
    }

    req.logIn(user, function (err) {
      if (err) {
        return res.render("login", { alerts: [String(err)], redirect:req.query.redirect });
      }
      console.log("Authenticated " + String(user));
      jwt.sign(
        { _id: req.user._id, level: req.user.level },
        "learnvault2023",
        { expiresIn: "3h" },
        function (e, token) {
          if (e) res.render("login", { alerts: [String(err)], redirect:req.query.redirect });
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
