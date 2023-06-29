var express = require("express");
var router = express.Router();
var resourceController = require("../controllers/resource");
var userController = require("../controllers/user");
var auth = require("../shared/auth");
var upload = require("../shared/upload");
var bag = require("../shared/bag");
var mongoose = require("mongoose");

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
      .map((author) => author.trim())
      .filter((t) => t.length);
    resource.hashtags = resource.hashTags
      .split(";")
      .map((hashTag) => hashTag.trim())
      .filter((t) => t);
    resource.posterID = res.locals.user._id;
    resource.isPublic = req.body.visibility == "public";
    try {
      var directory = await bag.validateFile(req.file);
      if (directory) {
        resource.directory = directory;
        resource = await resourceController.insert(resource);

        if (resource.isPublic) {
          await userController.sendNotification({
            title: "New resource posted",
            body: `New resource "${resource.title}" has been posted`,
            link: `/resources/${resource._id}`,
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
router.get("/", async function (req, res, next) {
  sortObj = null;
  filterObj = null;
  query = {
    publisher: "",
    title: "",
    tags: "",
    after: "",
    before: "",
    minRating: "",
    maxRating: "",
  };

  if (Object.keys(req.query).length > 0) {
    query = req.query;
    filterObj = {
      publisher: req.query.publisher,
      minDate: new Date(-8640000000000000),
      maxDate: new Date(8640000000000000),
      title: req.query.title,
      minRating: 0,
      maxRating: 5,
      tags: req.query.tags
        .split(";")
        .map((hashTag) => hashTag.trim())
        .filter((t) => t),
    };
  }
  if (req.query.sort) {
    sortObj = {};
    sortObj[req.query.sort] = 1;
  }

  if (req.query.after) {
    filterObj.minDate = Date.parse(req.query.after);
  }

  if (req.query.before) {
    filterObj.maxDate = Date.parse(req.query.before);
  }

  if (req.query.minRating) {
    filterObj.minRating = req.query.minRating;
  }

  if (req.query.maxRating) {
    filterObj.maxRating = req.query.maxRating;
  }
  console.dir(sortObj);
  console.dir(filterObj);
  try {
    var resources = await resourceController.list(
      res.locals.user,
      sortObj,
      filterObj
    );
    res.render("resources", {
      resources: resources,
      query: query,
    });
  } catch (err) {
    res.render("error", { error: err, message: "Erro ao listar recursos" });
  }
});

// Needs complete restructuring - we're supposed to be compressing resources
// and then downloading
router.get("/download/:fname", function (req, res) {
  const filename = req.params.fname;
  const originalName = filename.replace(/(.*?)-/, "");
  res.download(__dirname + "/../public/uploads/" + filename, originalName);
});

router.get("/:resourceID", auth.getResource, async function (req, res, next) {
  // add error handling
  const resource = await resourceController.get(req.params.resourceID);
  const tree = await bag.generateTree(
    "/app/public/uploads/" + resource.directory
  );
  res.render("resource", {
    tree: tree.split("\n"),
  });
});

router.post(
  "/:resourceID/comment",
  auth.getResource,
  auth.canComment,
  async function (req, res, next) {
    comment = req.body;
    comment.posterID = new mongoose.Types.ObjectId(res.locals.user._id);
    resource = await resourceController.addComment(
      res.locals.resource._id,
      comment
    );

    await userController.sendNotification(
      {
        title: `New comment in "${resource.title}"`,
        body: `${res.locals.user.name}: "${comment.text}"`,
        link: `/resources/${resource._id}`,
      },
      { _id: resource.posterID }
    );

    res.redirect("/resources/" + res.locals.resource._id);
  }
);

router.post(
  "/:resourceID/comment",
  auth.getResource,
  async function (req, res, next) {
    res.redirect("/login?redirect=/resources/" + res.locals.resource._id);
});

router.get("/delete/:resourceID", auth.getResource, auth.canEditResource, async function(req, res, next) {
  const status = await resourceController.remove(
    new mongoose.Types.ObjectId(res.locals.resource._id)
  )
  res.redirect("/")
})

router.get("/deletecomment/:resourceID", auth.getResource, auth.canEditComment, async function(req, res, next) {
  const status = await resourceController.removeComment(
    res.locals.resource._id,
    new mongoose.Types.ObjectId(req.query.posterID)
  )
  res.redirect("/resources/" + req.params.resourceID)
})

router.get("/togglevis/:resourceID", auth.getResource, auth.canEditResource, async function(req, res, next) {
  const status = await resourceController.toggleVisibility(
    res.locals.resource._id,
  )
  res.redirect("/resources/" + req.params.resourceID)
})

module.exports = router;
