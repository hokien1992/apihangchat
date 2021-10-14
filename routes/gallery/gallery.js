var express = require('express');
var router = express.Router();
var checkLogin = require('./../../Middlewares/CheckLogin');
var adminControllers = require('../../controllers/backend/AdminController');
//var JwtAuthMiddleware = require('../../Middlewares/JwtAuthMiddleware');
router.get('/', adminControllers.index);
router.get('/create', adminControllers.create);
router.get('/show/:id', adminControllers.show);
router.post('/store', adminControllers.store);
router.post('/update/:id', adminControllers.update);

module.exports = router;