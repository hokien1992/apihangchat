var express = require('express')
var router = express.Router()
const newController = require('../../controllers/api/NewController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
router.get('/list', newController.list)
router.get('/getAlls', newController.getAlls)
router.get('/getAll', newController.getAll)
router.get('/getAlltags', newController.getAlltags)
router.get('/show/:id', newController.show)
router.post('/store', newController.store)
router.post('/update/:id', newController.update)
router.post('/saveProductAndTag', newController.saveProductAndTag)
router.post('/saveProductAndTagAsync', newController.saveProductAndTagAsync)
router.post('/remove/:id', newController.remove)
router.post('/checkHome', newController.checkHome)
router.post('/checkFocus', newController.checkFocus)
router.get('/getDataUrl', newController.getDataUrl)
module.exports = router