var express = require('express')
var app = express()
var router = express.Router()
const MomoController = require('../../controllers/api/MomoController')
router.get('/testMomo', MomoController.testMomo)
module.exports = router