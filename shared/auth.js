var jwt = require("jsonwebtoken");
var userController = require("../controllers/user");
var resourceController = require("../controllers/resource");

// GLOBAL MIDDLEWARE
// Places the logged user in res.locals.user (null if no valid user is logged)
module.exports.getUser = function (req, res, next) {
  res.locals.user = null
  var tok = req.cookies.access_token_learnvault;
  if (tok) {
    jwt.verify(tok, "learnvault2023", async function (err, payload) {
      if (payload) {
        res.locals.user = await userController.get(payload._id)
        res.locals.notifications = await userController.getUnreadNotifications(payload._id)
      }
      next()
    })
  }
  else {
    next()
  }
};

// AUTHENTICATION AND VERIFICATION MIDDLEWARE
// Places the resource in res.locals.resource (null no valid resource is found)
module.exports.getResource = async function (req, res, next) {
  try {
    if (req.params.resourceID) {
      res.locals.resource = await resourceController.get(req.params.resourceID)
    }
    else {
      res.locals.resource = null
    }
  }
  catch (error) {
    res.locals.resource = null
  }
  next()
}

// Proceeds this route only if there is a res.locals.user and
// res.locals.user has level "admin"
module.exports.isAdmin = function (req, res, next) {
  if (res.locals.user && res.locals.user.level == "admin") {
    next()
  }
  else {
    next('route')
  }
};

// Proceeds this route only if there is a user in res.locals.user
module.exports.isLogged = function (req, res, next) {
  if (res.locals.user) {
    next()
  }
  else {
    console.log("Current locals:")
    console.dir(res.locals)
    next('route')
  }
};



// Proceeds this route only  if res.locals.resource and res.locals.user
// exist and posterID and _id (respectively) match
module.exports.loggedIsPoster = function (req, res, next) {
  if (
    res.locals.user && res.locals.resource &&
    res.locals.user._id == res.locals.resource.posterID
  ) {
    next()
  }
  next("route");
};
