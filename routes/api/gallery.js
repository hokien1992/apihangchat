var express = require('express')
var app = express()
var router = express.Router()
const galleryController = require('../../controllers/api/GalleryController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
//List recode with array id
router.get('/listDataWithId', galleryController.listDataWithId)
router.get('/getAll', galleryController.getAll)
router.get('/show/:id', galleryController.show)
router.post('/store', galleryController.store)
router.post('/remove/:id', galleryController.remove)
module.exports = router;