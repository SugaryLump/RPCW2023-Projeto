var express = require("express");
var router = express.Router();
var resourceController = require("../controllers/resource");
var resourceModel = require("../models/resource");
var auth = require("../shared/auth");
var upload = require("./upload");

router.get("/", function (req, res, next) {
  var d = new Date().toISOString().substring(0, 16);

  resourceController
    .list(req, res, next)
    .then((resources) => {
      res.render("resources", {
        resources: resources,
        d: d,
      });
    })
    .catch((err) => {
      res.render("error", { error: err, message: "Erro ao listar recursos" });
    });
});

router.get("/new", function (req, res, next) {
  var d = new Date().toISOString().substring(0, 16);
  res.render("addResourceForm", { d: d });
});

router.post("/new", upload.single("resource"), function (req, res, next) {
  resourceController.insert(req.body, req.file.filename);
  res.redirect("/resources");
  // adicionar error handling
  // lidar com subtitulo opcional
});

router.get("/download/:fname", function (req, res) {
  const filename = req.params.fname;
  const originalName = filename.replace(/(.*?)-/, "");
  res.download(__dirname + "/../public/uploads/" + filename, originalName);
});

module.exports = router;
