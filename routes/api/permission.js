var express = require('express');
var app = express();
var router = express.Router();
const permissionController = require('../../controllers/api/PermissionController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
//========End fix upload image
router.get('/list', permissionController.list);
router.get('/getAll', permissionController.getAll);
router.get('/show/:id', permissionController.show);
router.post('/store', permissionController.store);
router.post('/update/:id', permissionController.update);
router.post('/remove', permissionController.remove);
module.exports = router;