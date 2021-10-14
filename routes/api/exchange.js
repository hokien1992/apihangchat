var express = require('express');
var app = express();
var router = express.Router();
const exchangeController = require('../../controllers/api/ExchangeController');
const verifyToken = require('../../Middlewares/JwtAuthMiddleware');
//========End fix upload image
router.get('/apiDanhsachnaptien/:id', exchangeController.apiDanhsachnaptien);
router.get('/danhsachnaptien', exchangeController.danhsachnaptien);
router.get('/danhsachchuyendiem', exchangeController.danhsachchuyendiem);
router.get('/danhsachdonhang', exchangeController.danhsachdonhang);
//danhsachdonhang
router.get('/listAll/:id', exchangeController.listAll);
router.get('/list', exchangeController.list);
router.get('/getAll', exchangeController.getAll);
router.get('/show/:id', exchangeController.show);
router.post('/store', exchangeController.store);
router.post('/storeWallet6', exchangeController.storeWallet6);
router.post('/update/:id', exchangeController.update);
router.post('/update_status/:id', exchangeController.update_status);
router.post('/remove', exchangeController.remove);
router.get('/removeAll', exchangeController.removeAll);
router.post('/update_status_wallet3', exchangeController.update_status_wallet3);
module.exports = router;
