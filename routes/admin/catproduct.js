var express = require('express');
var app = express();
var router = express.Router();
const catproductController = require('../../controllers/backend/CatProductController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
var csurf = require('csurf');
var csrfProtection = csurf({ cookie: true });
//========End fix upload image
router.get('/', catproductController.list)
router.get('/getAll', catproductController.getAll)
router.get('/create', csrfProtection,catproductController.create)
router.get('/show/:id', csrfProtection, catproductController.show)
router.post('/store', catproductController.store)
router.post('/update/:id', catproductController.update)
router.post('/remove', catproductController.remove)
module.exports = router;