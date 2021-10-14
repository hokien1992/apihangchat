var express = require('express');
var router = express.Router();
const userController = require('../../controllers/api/UserController');
var JwtAuthMiddleware = require('../../Middlewares/JwtAuthMiddleware');
router.get('/list', userController.list)
router.get('/getAllSelect', userController.getAllSelect)
router.get('/getAll', userController.getAll)
router.get('/show/:id', userController.show)
router.post('/store', userController.store)
router.post('/update/:id', userController.update)
router.post('/updateApp/:id', userController.updateApp)
router.post('/remove/:id', userController.remove)
router.post('/checkStatus', userController.checkStatus)
router.post('/storeApp', userController.storeApp)
module.exports = router
