var express = require('express');
var router = express.Router();
const tagController = require('../../controllers/api/TagController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
router.get('/getAll', tagController.getAll)
router.get('/list', tagController.list)
router.post('/remove', tagController.remove)
module.exports = router;