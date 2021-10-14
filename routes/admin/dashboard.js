var express = require('express');
var router = express.Router();
var dashboardControllers = require('../../controllers/backend/DashboardController');
//var JwtAuthMiddleware = require('../../Middlewares/JwtAuthMiddleware');
router.get('/', dashboardControllers.home);
module.exports = router;