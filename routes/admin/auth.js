//require('../config/passport');
var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var csrfProtection = csrf();
router.use(csrfProtection);
//Quan ly thong tin quản trị
router.get('/login', function(req, res, next){
  var messages = req.flash('error');
  res.render('backend/admin/login', { title: 'Đăng nhập', csrfToken: req.csrfToken(), layout: 'layouts/login', messages: messages, hasErrors: messages.length > 0 });
});
router.post('/login', passport.authenticate('local.authLogin', {
  successRedirect: '/backend',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

module.exports = router;