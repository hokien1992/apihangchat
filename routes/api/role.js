var express = require('express');
var app = express();
var router = express.Router();
const roleController = require('../../controllers/api/RoleController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
//========End fix upload image
router.get('/list', roleController.list);
router.get('/getAll', roleController.getAll);
router.get('/show/:id', roleController.show);
router.post('/store', roleController.store);
router.post('/update/:id', roleController.update);
router.post('/remove', roleController.remove);
module.exports = router;