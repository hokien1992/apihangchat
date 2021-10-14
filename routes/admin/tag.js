var express = require('express');
var router = express.Router();
const tagController = require('../../controllers/api/TagController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
router.get('/getAll', verifyToken, tagController.getAll);
module.exports = router;