var express = require("express");
var router = express.Router();
var auth = require("../shared/auth");
var userController = require("../controllers/user");
var userModel = require("../models/user");
var ObjectId = require("mongodb").ObjectId;

router.get("/edit", auth.isLogged, async function (req, res) {
  res.render("profile", { editUser: res.locals.user });
});

router.post("/edit", auth.isLogged, async function (req, res) {
  // TODO update specific fields user
  try {
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
    res.render("profile", { editUser: user, result: "Updated Successfully" });
  } catch (err) {
    console.log(err);
    res.render("profile", { editUser: res.locals.user, result: err });
  }
});


router.get('/:userId/edit', auth.isAdmin, async (req, res) => {
  let user = await userController.get(req.params.userId);
  res.render("profile", { editUser: user });
})

router.post('/:userId/edit', auth.isAdmin, async (req, res) => {
  try {
    let user = await userModel.findOneAndUpdate(
      { _id: req.params.userId },
      {
        $set: {
          email: req.body.email,
          name: req.body.name,
          affiliation: req.body.affiliation,
        },
      },
      { new: true }
    );
    req.flash('success', 'Updated successfully');
    res.render("profile", { editUser: user });
  } catch (err) {
    req.flash('error', err.toString());
    let user = await userController.get(userId);
    res.render("profile", { editUser: user });
  }
})

router.post('/:userId/password', auth.isLogged, async (req, res) => {
  let user = await userController.get(req.params.userId);
  let isAdmin = res.locals.user.level == "admin"
  if (res.locals.user._id != user._id && !isAdmin) {
    // TODO
    res.status(403).send('No permission');
    return;
  } 

  try {
    if (!req.body.new_password || !req.body.new_password_confirm || (!req.body.password && !isAdmin)) {
      req.flash('error', "All fields are mandatory")
    } else if (req.body.new_password != req.body.new_password_confirm) {
      req.flash('error', "Passwords must match")
    } else if (req.body.new_password.length == 0) {
      req.flash('error', 'Password must not be empty')
    } else {
      if (!isAdmin)
        await user.changePassword(req.body.password, req.body.new_password)
      else
        await user.setPassword(req.body.new_password)
      req.flash('success', 'Password changed')
    }
  } catch (err) {
    console.log(err)
    req.flash('error', err.toString());
  }

  if (isAdmin)
    res.redirect(`/user/${user._id}/edit`);
  else
    res.redirect(`/user/edit`);
})

router.get("/", async function (req, res) {
  res.redirect("/login");
});

module.exports = router;