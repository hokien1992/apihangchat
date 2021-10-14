var express = require('express')
var router = express.Router()
var aliasControllers = require('../../controllers/api/AliasController')
router.get('/getAll', aliasControllers.getAll)
router.get('/list', aliasControllers.list)
router.post('/remove', aliasControllers.remove)
module.exports = router