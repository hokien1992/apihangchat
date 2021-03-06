var express = require('express')
var app = express()
var router = express.Router()
const catproductController = require('../../controllers/api/CatProductController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
//========End fix upload image
router.get('/getAllProject', catproductController.getAllProject)
router.get('/list', catproductController.list)
router.get('/limitCatproduct', catproductController.limitCatproduct)
router.get('/getAll', catproductController.getAll)
router.get('/show/:id', catproductController.show)
router.post('/store', catproductController.store)
router.post('/update/:id', catproductController.update)
router.post('/remove', catproductController.remove)
router.get('/getDataUrl', catproductController.getDataUrl)
router.post('/checkHome', catproductController.checkHome)
router.post('/checkFocus', catproductController.checkFocus)
module.exports = router;
