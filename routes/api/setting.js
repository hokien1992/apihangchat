var express = require('express')
var router = express.Router()
const productController = require('../../controllers/api/SettingController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
router.get('/show/:lang', productController.show);
router.post('/update/:lang', productController.update);
router.post('/remove', productController.remove)
module.exports = router;