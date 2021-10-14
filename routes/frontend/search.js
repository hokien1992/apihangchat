var express = require('express')
var app = express()
var router = express.Router()
const searchController = require('../../controllers/frontend/SearchController')
const verifyToken = require('../../Middlewares/JwtAuthMiddleware')
var csurf = require('csurf')
var csrfProtection = csurf({ cookie: true })
//========End fix upload image
router.get('/', searchController.search)
module.exports = router
