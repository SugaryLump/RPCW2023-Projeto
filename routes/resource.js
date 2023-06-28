var express = require("express");
var router = express.Router();
var resourceController = require("../controllers/resource");
var resourceModel = require("../models/resource");
var auth = require("../shared/auth");
var upload = require("./upload");

// # AUTHENTICATED ROUTES
// ## New Resource
router.get("/new", auth.isLogged, function (req, res, next) {
  var d = new Date().toISOString().substring(0, 16);
  res.render("addResourceForm", { d: d });
});

// severely lacking in error handling!!
router.post(
  "/new",
  auth.isLogged,
  upload.single("resource"),
  async function (req, res, next) 
  {
    resource = req.body;
    resource.authors = resource.authors
      .split(";")
      .map((author) => author.trim());
    resource.hashtags = resource.hashtags
      .split(";")
      .map((hashtag) => hashtag.trim());
    resource.posterID = res.locals.user._id;
    resource = await resourceController.insert(resource);
    res.redirect("/resources/" + resource._id);
  }
);

router.all("/new", function (req, res, next) {
  res.redirect("/login?redirect=/resources/new");
});

// # UNRESTRICTED ROUTES
router.get("/", function (req, res, next) {
  console.log("request from: " + req.user);

  resourceController
    .list(req, res, next)
    .then((resources) => {
      res.render("resources", {
        resources: resources,
      });
    })
    .catch((err) => {
      res.render("error", { error: err, message: "Erro ao listar recursos" });
    });
});

// Needs complete restructuring - we're supposed to be compressing resources
// and then downloading
router.get("/download/:fname", function (req, res) {
  const filename = req.params.fname;
  const originalName = filename.replace(/(.*?)-/, "");
  res.download(__dirname + "/../public/uploads/" + filename, originalName);
});

router.get("/:resourceID", auth.getResource, function (req, res, next) {
  console.dir(req.params)
  res.render("resource");
});

module.exports = router;
