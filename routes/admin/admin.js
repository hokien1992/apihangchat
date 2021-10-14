var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true });
const { check, validationResult } = require('express-validator/check');
var checkLogin = require('./../../Middlewares/CheckLogin');
var adminControllers = require('../../controllers/backend/AdminController');
//var JwtAuthMiddleware = require('../../Middlewares/JwtAuthMiddleware');
router.get('/', csrfProtection, adminControllers.index);
router.get('/create', csrfProtection, adminControllers.create);
router.get('/show/:id', adminControllers.show);
router.post('/store', adminControllers.store);
router.post('/update/:id', adminControllers.update);

module.exports = router;