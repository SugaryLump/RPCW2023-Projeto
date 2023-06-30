var express = require("express");
var router = express.Router();
var resourceController = require("../controllers/resource");
var userController = require("../controllers/user");
var auth = require("../shared/auth");
var upload = require("../shared/upload");
var bag = require("../shared/bag");
var mongoose = require("mongoose");

router.post('/type/new', auth.isAdmin, async (req, res) => {
  if (!req.body.name || req.body.name.trim().length == 0) {
    req.flash('error', 'Name can not be empty')
  } else {
    try {
      await resourceController.addType(req.body.name);
      req.flash('success', 'Added resource')
    } catch (err) {
      req.flash('error', err.toString())
    }
  }

  res.redirect('/admin')
})

router.post('/type/:resourceTypeId/edit', auth.isAdmin, async (req, res) => {
  if (!req.body.name || req.body.name.trim().length == 0) {
    req.flash('error', 'Name can not be empty')
  } else {
    try {
      await resourceController.renameType(req.params.resourceTypeId, req.body.name);
      req.flash('success', 'Changed resource')
    } catch (err) {
      req.flash('error', err.toString())
    }
  }

  res.redirect('/admin')
})

router.get("/new", auth.isLogged, async function (req, res) {
  let resourceTypes = await resourceController.listTypes();
  res.render("addResourceForm", { resourceTypes });
});

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
    resource.hashTags = resource.hashTags
      .split(";")
      .map((hashTag) => hashTag.trim())
      .filter((t) => t);
    resource.posterID = res.locals.user._id;
    resource.isPublic = req.body.visibility == "public";
    if (req.body.type != "other") {
      resource.type = req.body.type;
    }
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
        req.flash("Wrong file type");
        res.redirect('/resources/new');
      }
    } catch (err) {
      res.render("error", {
        error: err,
        message: "Error while uploading resource",
      });
    }
  }
);

router.get(
  "/:resourceID/edit",
  auth.getResource,
  auth.canEditResource,
  async function (req, res, next) {
    let resourceTypes = await resourceController.listTypes();
    res.render('editResourceForm', { resourceTypes })
  })


router.post(
  "/:resourceID/edit",
  auth.getResource,
  auth.canEditResource,
  async function (req, res, next) {
    let resource = req.body;
    console.dir(resource);
    resource.authors = resource.authors
      .split(";")
      .map((author) => author.trim())
      .filter((t) => t.length);
    resource.hashTags = resource.hashTags
      .split(";")
      .map((hashTag) => hashTag.trim())
      .filter((t) => t.length);
    resource.posterID = res.locals.user._id;
    resource.isPublic = req.body.visibility == "public";
    resource._id = req.params.resourceID;
    if (req.body.type != "other") {
      resource.type = req.body.type;
    }
    try {
      resource = await resourceController.update(resource);
      if (resource.isPublic) {
        await userController.sendNotification({
          title: "Resource edited",
          body: `Resource "${resource.title}" has been edited`,
          link: `/resources/${resource._id}`,
        },
          { _id: resource.posterID });
      }
      req.flash('success', 'Resource edited')
      res.redirect("/resources/" + resource._id);
    } catch (err) {
      res.render("error", {
        error: err,
        message: "Error while editing resource",
      });
    }
  }
);

router.all("/new", function (req, res, next) {
  res.redirect("/login?redirect=/resources/new");
});

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
router.get("/download/:resourceID", async function (req, res) {
  const resource = await resourceController.get(req.params.resourceID);
  const filename = resource.directory;
  const originalName = filename.replace(/(.*?)-/, "");
  const compressedPath = await bag.compressFile(filename);
  res.download(compressedPath, originalName + ".zip");
  bag.deleteFile(compressedPath);
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
  }
);

router.get(
  "/:resourceID/delete",
  auth.getResource,
  auth.canEditResource,
  async function (req, res, next) {
    const status = await resourceController.remove(
      new mongoose.Types.ObjectId(res.locals.resource._id)
    );
    res.redirect("/");
  }
);

router.get("/:resourceID/deletecomment", auth.getResource, auth.canEditComment, async function (req, res, next) {
  const status = await resourceController.removeComment(
    res.locals.resource._id,
    new mongoose.Types.ObjectId(req.query.posterID)
  )
  res.redirect("/resources/" + req.params.resourceID)
})

router.get("/:resourceID/togglevis", auth.getResource, auth.canEditResource, async function (req, res, next) {
  const status = await resourceController.toggleVisibility(
    res.locals.resource._id,
  )
  res.redirect("/resources/" + req.params.resourceID)
})

module.exports = router;
