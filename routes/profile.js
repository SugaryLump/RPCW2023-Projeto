var express = require("express");
var router = express.Router();
var auth = require("../shared/auth");
var userController = require("../controllers/user");
var userModel = require("../models/user");
var upload = require("./upload");
var ObjectId = require("mongodb").ObjectId;

router.get("/", auth.isLogged, async function (req, res) {
  res.render("profile", { user: req.user });
});

router.post("/", auth.isLogged, async function (req, res) {
  // TODO update specific fields user
  try {
    console.log(req.user._id);
    var user = await userModel.findOneAndUpdate(
      { _id: req.user._id },
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
    res.render("profile", { user: req.user, result: err });
  }
});
module.exports = router;
