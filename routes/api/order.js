var express = require('express');
var app = express();
var router = express.Router();
const orderController = require('../../controllers/api/OrderController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
//========End fix upload image
router.get('/list', orderController.list);
router.get('/getAll', orderController.getAll);
router.get('/show/:id', orderController.show);
router.post('/store', orderController.store);
router.post('/update/:id', orderController.update);
router.post('/remove', orderController.remove);
module.exports = router;