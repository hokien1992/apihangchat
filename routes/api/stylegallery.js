var express = require('express')
var app = express()
var router = express.Router()
const stylegalleryController = require('../../controllers/api/StylegalleryController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
//========End fix upload image
router.get('/list', stylegalleryController.list)
router.get('/getAll', stylegalleryController.getAll)
router.get('/show/:id', stylegalleryController.show)
router.post('/store', stylegalleryController.store)
router.post('/update/:id', stylegalleryController.update)
router.post('/remove', stylegalleryController.remove)
module.exports = router