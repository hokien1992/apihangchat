var express = require('express')
var app = express()
var router = express.Router()
const photoController = require('../../controllers/api/PhotoController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
//========End fix upload image
router.get('/list', photoController.list)
router.get('/getAll', photoController.getAll)
router.get('/show/:id', photoController.show)
router.post('/store', photoController.store)
router.post('/update/:id', photoController.update)
router.post('/remove', photoController.remove)
module.exports = router