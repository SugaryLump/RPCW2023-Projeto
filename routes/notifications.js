var express = require("express");
var router = express.Router();
var userController = require("../controllers/user");
var auth = require('../shared/auth');

router.get('/new', auth.isAdmin, async (req, res) => {
  res.render('newNotification');
})

router.post('/new', auth.isAdmin, async (req, res) => {
  let notification = {
    title: req.body.title,
    body: req.body.body
  };

  if (req.body.enableLink) {
    notification.link = req.body.link;
  }

  let user = req.body.enableUser ? { email: req.body.user } : null;

  const not = await userController.sendNotification(notification, user);

  res.redirect('/notifications/new');
})

router.get('/read', async (req, res) => {
  await userController.clearNotifications(res.locals.user._id);

  res.send({'status': 'ok'})
});

module.exports = router;