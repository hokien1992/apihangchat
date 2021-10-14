var express = require('express');
var app = express();
var router = express.Router();
const galleryController = require('../../controllers/backend/GalleryController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');

router.get('/lists', galleryController.lists);
router.get('/showModalGallery', galleryController.showModalGallery);
router.get('/show/:id', galleryController.show);
router.post('/store', galleryController.store);
module.exports = router;