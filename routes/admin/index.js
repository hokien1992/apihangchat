var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var assert = require('assert');
var Admin = require('../../models/admin');
var csrfProtection = csrf();
router.use(csrfProtection);
apps = express();

//Quan ly thong tin khach hang
router.get('/profile', function(req, res, next){
    res.render('backend/admin/profile',{ title: 'Profile', layout: 'layouts/backend/home' });
});
router.get('/logout', function(req, res, next){
    req.logOut();
    res.redirect('/admin/login');
});
router.get('/', function(req, res, next){
    res.redirect('/admin/dashboard');
});
router.get('/dashboard', function(req, res, next){
    res.render('backend/dashboard',{ title: 'Dashboard', layout: 'layouts/backend/home' });
});

// crud admin
// router.get('/list', function(req, res, next){
//     Admin.find(function(err, docs){
//         res.render('backend/admin/list', { title:"Danh sách sản phẩm", layout: 'layouts/backend/home', result: docs });
//       });
    
// });
router.get('/add', function(req, res, next) {
    res.render('backend/admin/add', { title: 'Đăng ký', csrfToken: req.csrfToken(), layout: 'layouts/backend/home' });
});
router.post('/add', function(req, res, next){
    //console.log(req.files);
    Admin.findOne({'email': req.body.email}, function(err, admin){
        if(err){
            return done(err);
        }
        if(admin){
            return done(null, false, {message: 'Email đã được sử dụng!'});
        }
        var newPost = new Admin();
        newPost.name = req.body.name;
        newPost.address = req.body.address;
        newPost.email = req.body.email;
        newPost.password = newPost.encryptPassword(req.body.password);
        newPost.save(function(err, newPost){
            if(err){
                return done(null, newPost);
            }
            res.redirect('/admin/list');
        });
    });
});
// router.post('/add', isLoggedInAdmin, function(req, res, next){
//     console.log(req);
// });
router.use('/', notLoggedInAdmin, function(req, res, next){
    next();
});
/* GET users listing. */
router.get('/login', function(req, res, next){
  var messages = req.flash('error');
  res.render('backend/admin/login', { title: 'Đăng nhập', csrfToken: req.csrfToken(), layout: 'layouts/login', messages: messages, hasErrors: messages.length > 0 });
});
router.post('/login', passport.authenticate('local.adminLogin', {
  successRedirect: '/admin/dashboard',
  failureRedirect: '/admin/login',
  failureFlash: true
}));

module.exports = router;

function isLoggedInAdmin(req, res, next){
  if(req.isAuthenticated('local.adminLogin')){
    return next();
  }
  res.redirect('/admin/login');
}
function notLoggedInAdmin(req, res, next){
  if(!req.isAuthenticated('local.adminLogin')){
    return next();
  }
  res.redirect('/admin/login');
}
