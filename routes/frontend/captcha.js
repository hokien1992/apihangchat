var express = require('express')
var app = express()
var router = express.Router()
const captchaController = require('../../controllers/frontend/CaptchaController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
var csurf = require('csurf')
var csrfProtection = csurf({ cookie: true })
//========End fix upload image
router.get('/viewcaptcha', captchaController.viewcaptcha)
module.exports = router
