var express = require("express");
var router = express.Router();
var resourceController = require("../controllers/resource");
var resourceModel = require("../models/resource");

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

module.exports = router;