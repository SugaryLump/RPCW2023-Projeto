var express = require("express");
var router = express.Router();
var resourceController = require("../controllers/resource");
var userController = require('../controllers/user');
var auth = require("../shared/auth");
var upload = require("../shared/upload");
var bag = require("../shared/bag");

// # AUTHENTICATED ROUTES
// ## New Resource
router.get("/new", auth.isLogged, function (req, res, next) {
  res.render("addResourceForm");
});

// severely lacking in error handling!!
router.post(
  "/new",
  auth.isLogged,
  upload.single("resource"),
  async function (req, res, next) {
    let resource = req.body;
    resource.authors = resource.authors
      .split(";")
      .map((author) => author.trim());
    resource.hashtags = resource.hashtags
      .split(";")
      .map((hashtag) => hashtag.trim());
    resource.posterID = res.locals.user._id;
    try {
      var r = await bag.validateFile(req.file);
      if (r) {
        resource = resourceController.insert(resource);
        
        if (resource.isPublic) {
          await userController.sendNotification({
            title: "New resource posted",
            body: `New resource "${resource.title}" has been posted`,
            link: `/resources/${resource._id}`
          });
        }

        res.redirect("/resources/" + resource._id);
      } else {
        res.locals.error = "Wrong File Type";
        res.locals.resource = resource;
        res.render("addResourceForm");
      }
    } catch (err) {
      res.render("error", {
        error: err,
        message: "Error while uploading resource",
      });
    }
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

router.get("/:resourceID", function (req, res, next) {
  res.render("resource");
});

module.exports = router;
