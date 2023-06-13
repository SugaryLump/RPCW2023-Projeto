var express = require('express');
var router = express.Router();
var userController = require('../controllers/user')
var userModel = require('../models/user')
var passport = require('passport')
var jwt = require('jsonwebtoken')
var auth = require('../shared/auth')

router.get('/', auth.isLogged, function(req, res, next) {
  res.render('index', {title: 'Express'})
});

router.get('/', function(req, res, next) {
  res.redirect('/login')
});

module.exports = router;
