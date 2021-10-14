var express = require('express');
var app = express();
var router = express.Router();
const supplierController = require('../../controllers/api/SupplierController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
//========End fix upload image
router.get('/list', supplierController.list);
router.get('/getAll', supplierController.getAll);
router.get('/show/:id', supplierController.show);
router.post('/store', supplierController.store);
router.post('/update/:id', supplierController.update);
router.post('/remove', supplierController.remove);
router.post('/checkHome', supplierController.checkHome)
module.exports = router;
