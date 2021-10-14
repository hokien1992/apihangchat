var express = require('express')
var app = express()
var router = express.Router()
const foldermediaController = require('../../controllers/api/FoldermediaController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
router.get('/list', foldermediaController.list)
router.get('/getAll', foldermediaController.getAll)
router.get('/itemParentNull', foldermediaController.itemParentNull)
router.get('/show/:id', foldermediaController.show)
router.post('/store', foldermediaController.store)
router.post('/update/:id', foldermediaController.update)
router.post('/remove/:id', foldermediaController.remove)
module.exports = router