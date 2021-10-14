var express = require('express');
var app = express();
var router = express.Router();
const menuController = require('../../controllers/api/MenuController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
//========End fix upload image
router.get('/list', menuController.list);
router.get('/listmenu', menuController.listmenu);
router.get('/getAll', menuController.getAll);
router.get('/getAlls', menuController.getAlls);
router.get('/show/:id', menuController.show);
router.post('/store', menuController.store);
router.post('/update/:id', menuController.update);
router.post('/remove', menuController.remove);
module.exports = router;