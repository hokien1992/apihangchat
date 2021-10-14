
var express = require('express');
var app = express();
var router = express.Router();
const ladingController = require('../../controllers/api/LadingController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
//========End fix upload image
router.get('/list', ladingController.list);
router.get('/listWithOrder', ladingController.listWithOrder);
router.post('/store', ladingController.store);
module.exports = router;
