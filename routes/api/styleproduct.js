var express = require('express');
var app = express();
var router = express.Router();
const styleproductController = require('../../controllers/api/StyleProductController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
router.post('/checkHome', styleproductController.checkHome)
router.post('/checkFocus', styleproductController.checkFocus)
router.get('/list', styleproductController.list)
router.get('/getAll', styleproductController.getAll)
router.get('/show/:id', styleproductController.show)
router.post('/store', styleproductController.store)
router.post('/update/:id', styleproductController.update)
router.post('/remove', styleproductController.remove)
router.get('/getDataUrl', styleproductController.getDataUrl)
module.exports = router;