var jwt = require("jsonwebtoken");
var userController = require("../controllers/user");
var resourceController = require("../controllers/resource");
var mongoose = require("mongoose")

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
      if (res.locals.resource.isPublic || String(res.locals.resource.posterID) == String(res.locals.user._id)) {
        next()
      }
      else {
        next('route')
      }
    }
    else {
      next('route')
    }
  }
  catch (error) {
    next('route')
  }
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
    next('route')
  }
};



// Proceeds this route only  if res.locals.resource and res.locals.user
// exist and posterID and _id (respectively) match or user is admin
module.exports.canEditResource = function (req, res, next) {
  if (
    res.locals.user && res.locals.resource &&
    (res.locals.user._id == res.locals.resource.posterID ||
     res.locals.user.leve == "admin")
  ) {
    next()
  }
  else {
    next("route");
  }
};

// Proceeds this route only if res.locals.resource and res.locals.user
// exist and the user is either an admin or the comment poster (comment
// is referenced via a combination of resource and comment posterID)
module.exports.canEditComment = function (req, res, next) {
  if (
    res.locals.user && res.locals.resource && req.query.posterID &&
    (String(res.locals.user._id) == req.query.posterID ||
     res.locals.user.leve == "admin")
  ) {
    next()
  } else {
    next("route");
  }
};

// Proceeds this route only if res.locals.resource and res.locals.user
// exist and the user has not commented on this resource
module.exports.canComment = function (req, res, next) {
  if (
    res.locals.user && res.locals.resource &&
    res.locals.resource.comments.every(c => String(c.posterID) != res.locals.user._id)
  ) {
    next()
  }
  else {
    next("route");
  }
};