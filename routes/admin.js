let router = require("express").Router();
let userController = require("../controllers/user")
let auth = require('../shared/auth')

router.get("/", auth.isAdmin, async (req, res) => {
  users = await userController.getAll({ page: 0, limit: 20 })

  res.render('admin', { users })
})

module.exports = router;