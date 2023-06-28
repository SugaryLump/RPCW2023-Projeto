var express = require("express");
var router = express.Router();
var auth = require("../shared/auth");
var userController = require("../controllers/user");
var userModel = require("../models/user");
var upload = require("./upload");
var ObjectId = require("mongodb").ObjectId;

router.get("/", auth.isLogged, async function (req, res) {
  res.render("profile", { user: res.locals.user });
});

router.post("/", auth.isLogged, async function (req, res) {
  // TODO update specific fields user
  try {
    console.log(res.locals.user._id);
    console.log(req.body.affiliation);
    var user = await userModel.findOneAndUpdate(
      { _id: res.locals.user._id },
      {
        $set: {
          email: req.body.email,
          name: req.body.name,
          affiliation: req.body.affiliation,
        },
      },
      { new: true }
    );
    res.render("profile", { user: user, result: "Updated Successfully" });
  } catch (err) {
    console.log(err);
    res.render("profile", { user: res.locals.user, result: err });
  }
});

router.get("/", async function (req, res) {
  res.redirect("/login");
});

module.exports = router