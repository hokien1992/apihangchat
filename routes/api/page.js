var express = require('express')
var app = express()
var router = express.Router()
const pageController = require('../../controllers/api/PageController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
//========End fix upload image
router.get('/list', pageController.list)
router.get('/getAll', pageController.getAll)
router.get('/show/:id', pageController.show)
router.post('/store', pageController.store)
router.post('/update/:id', pageController.update)
router.post('/remove', pageController.remove)
router.post('/checkHome', pageController.checkHome)
router.post('/checkFocus', pageController.checkFocus)
router.get('/getDataUrl', pageController.getDataUrl)
module.exports = router
