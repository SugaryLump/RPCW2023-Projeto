let router = require("express").Router();
let userController = require("../controllers/user")
let resourceController = require("../controllers/resource")
let auth = require('../shared/auth')

router.get("/", auth.isAdmin, async (req, res) => {
  let users = await userController.getAll({ page: 0, limit: 20 })
  let resources = await resourceController.list()

  res.render('admin', { users, resources })
})

module.exports = router;
