var express = require('express');
var app = express();
var router = express.Router();
const positionmenuController = require('../../controllers/api/PositionmenuController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
//========End fix upload image
router.get('/list', positionmenuController.list);
router.get('/getAll', positionmenuController.getAll);
router.get('/showKeyname', positionmenuController.showKeyname)
router.get('/show/:id', positionmenuController.show);
router.post('/store', positionmenuController.store);
router.post('/update/:id', positionmenuController.update);
router.post('/remove', positionmenuController.remove);
module.exports = router;
