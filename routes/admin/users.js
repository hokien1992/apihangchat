var express = require('express');
var router = express.Router();
const userController = require('../../controllers/frontend/UserController');
var JwtAuthMiddleware = require('../../Middlewares/JwtAuthMiddleware');
router.get('/list/', JwtAuthMiddleware, userController.list);
router.get('/show/:id', JwtAuthMiddleware, userController.show);
router.post('/store', JwtAuthMiddleware, userController.store);
router.post('/update/:id', JwtAuthMiddleware, userController.update);
module.exports = router;