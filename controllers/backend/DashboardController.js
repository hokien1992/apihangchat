var express = require('express');
var bcrypt = require('bcryptjs');
var Admin = require("../../models/admin");
var dashboardController = {};
var router = express.Router();
//router.use(csrfProtection);
dashboardController.home = function(req, res, next) {
    //res.send('ok');
  res.render('backend/dashboard', { results: req.body, layout: 'layouts/backend/home' });
};
module.exports = dashboardController;