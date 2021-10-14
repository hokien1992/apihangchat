var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var axios = require('axios');
var nodemailer =  require('nodemailer');
var csrfProtection = csrf()
//router.use(csrfProtection)
var Address = require('../models/address')
//Giỏ hàng
var Cart = require('../models/cart')
var Product = require('../models/product')
var Catproduct = require('../models/catproduct')
var Styleproduct = require('../models/styleproduct')
var Catnew = require('../models/catnew')
var New = require('../models/new')
var Setting = require('../models/setting')
var Menu = require('../models/menu')
var Photo = require('../models/photo')
var Location = require('../models/location')
// Ví
var Exchange = require('../models/exchange')
var Wallet = require('../models/wallet_v1')
var Wallet2 = require('../models/wallet_v2')
var Wallet3 = require('../models/wallet_v3')
var Users = require('../models/user')
    //thêm Controller
const productController = require('../controllers/frontend/ProductController')
const newController = require('../controllers/frontend/NewsController')
const pageController = require('../controllers/frontend/PageController')
const orderController = require('../controllers/frontend/OrderController')
const locationController = require('../controllers/frontend/LocationController')
const searchController = require('../controllers/frontend/SearchController')
const url = require('url')
const fs = require('fs')
const excel = require('node-excel-export')
const datatest = require('./datatest.json')
/* GET home page. */
router.get('/', csrfProtection, async function(req, res, next) {
     var products = await Product.find({})
    var catproducts_sidebar = await Catproduct.find({ parent_id: null })
        //Hiển thị danh mục phân cấp
    if (catproducts_sidebar.length > 0) {
        for (i = 0; i < catproducts_sidebar.length; i++) {
            catproducts_sidebar[i].parent = await Catproduct.find({ parent_id: catproducts_sidebar[i]._id })
                //Lấy danh sách con của danh mục
            for (j = 0; j < catproducts_sidebar[i].parent.length; j++) {
                catproducts_sidebar[i].parent[j].parent = await Catproduct.find({ parent_id: catproducts_sidebar[i].parent[j]._id })
            }
            //Tách 1 mảng thành nhiều mảng
            var productChunksCat = []
            var chunkSizeCat = 3
            for (var n = 0; n < catproducts_sidebar[i].parent.length; n += chunkSizeCat) {
                await productChunksCat.push(catproducts_sidebar[i].parent.slice(n, n + chunkSizeCat))
            }
            catproducts_sidebar[i].parent = productChunksCat
        }
    }
    //res.send(catproducts_sidebar)
    let catproducts = await Catproduct.find({
      parent_id: null,
      home: 1
     }).populate('imageNumber')
        // Danh sách sản phẩm theo loại sản phẩm đầu trang
        let listProductStype = []
    let styleProductHome = await Styleproduct.findOne({ home: 1 })
    if(styleProductHome){
      listProductStype = await Product.find({ _id: { $in: styleProductHome.arr_product_ids } }).populate('imageNumber').skip(0).limit(12)
    }

        // Kêt thúc Danh sách sản phẩm theo loại sản phẩm đầu trang
    let settings = await Setting.findOne({ lang: "index" }).populate('logo').populate('favicon')
    for (i = 0; i < catproducts.length; i++) {
        catproducts[i].styles = await Styleproduct.find({});
        catproducts[i].children = await Catproduct.find({ _id: { $in: catproducts[i].childs } })
        for (j = 0; j < catproducts[i].styles.length; j++) {
            catproducts[i].styles[j].listproductstyle = await Product.find({ $and: [{ _id: { $in: catproducts[i].arr_id_product } }, { _id: { $in: catproducts[i].styles[j].arr_product_ids } }] })
                .populate('imageNumber').skip(0).limit(12)
            var productChunks = []
            var chunkSize = 2
            for (var n = 0; n < catproducts[i].styles[j].listproductstyle.length; n += chunkSize) {
                productChunks.push(catproducts[i].styles[j].listproductstyle.slice(n, n + chunkSize))
            }
            catproducts[i].styles[j].listproductstyle = productChunks
        }
    }
    //res.send(catproducts)
    var datamenuservice = await Menu.find({ keyname: "menu_service", parent_id: null }).sort({ sort: 1 })
    //Hiển thị menu top
    var datamenu = await Menu.find({ keyname: "menu_top", parent_id: null }).sort({ sort: 1 })
    if (datamenu.length > 0) {
        for (i = 0; i < datamenu.length; i++) {
            datamenu[i].children = await Menu.find({ parent_id: datamenu[i]._id })
            if (datamenu[i].children.length > 0) {
                for (j = 0; j < datamenu[i].children.length; j++) {
                    datamenu[i].children[j].children = await Menu.find({ parent_id: datamenu[i].children[j]._id })
                }
            }
        }
    }
    //Hiển thị menu chân trang
    var datamenuBottom = await Menu.find({ keyname: "menu_bottom", parent_id: null })
    if (datamenuBottom.length > 0) {
        for (i = 0; i < datamenuBottom.length; i++) {
            datamenuBottom[i].children = await Menu.find({ parent_id: datamenuBottom[i]._id })
            if (datamenuBottom[i].children.length > 0) {
                for (j = 0; j < datamenuBottom[i].children.length; j++) {
                    datamenuBottom[i].children[j].children = await Menu.find({ parent_id: datamenuBottom[i].children[j]._id })
                }
            }
        }
    }
    //Hiển thị menu chân trang 1
    var datamenuBottom1 = await Menu.find({ keyname: "menu_footer1", parent_id: null })
    if (datamenuBottom1.length > 0) {
        for (i = 0; i < datamenuBottom1.length; i++) {
            datamenuBottom1[i].children = await Menu.find({ parent_id: datamenuBottom1[i]._id })
            if (datamenuBottom1[i].children.length > 0) {
                for (j = 0; j < datamenuBottom1[i].children.length; j++) {
                    datamenuBottom1[i].children[j].children = await Menu.find({ parent_id: datamenuBottom1[i].children[j]._id })
                }
            }
        }
    }
    //Hiển thị menu chân trang 1
    var datamenuBottom2 = await Menu.find({ keyname: "menu_footer2", parent_id: null })
    if (datamenuBottom2.length > 0) {
        for (i = 0; i < datamenuBottom2.length; i++) {
            datamenuBottom2[i].children = await Menu.find({ parent_id: datamenuBottom2[i]._id })
            if (datamenuBottom2[i].children.length > 0) {
                for (j = 0; j < datamenuBottom2[i].children.length; j++) {
                    datamenuBottom2[i].children[j].children = await Menu.find({ parent_id: datamenuBottom2[i].children[j]._id })
                }
            }
        }
    }
    //Hiển thị menu đối tác chân trang
    var datamenupartner = await Menu.find({ keyname: "partner_bottom", parent_id: null }).sort({ sort: 1 })
    if (datamenupartner.length > 0) {
        for (i = 0; i < datamenupartner.length; i++) {
            datamenupartner[i].children = await Menu.find({ parent_id: datamenupartner[i]._id })
            if (datamenupartner[i].children.length > 0) {
                for (j = 0; j < datamenupartner[i].children.length; j++) {
                    datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
                }
            }
        }
    }
    //Hiển thị sldier trang chủ (sldier_home)
    var sliderHome = await Photo.find({ keyname: "slider_home" })
        // Danh mục tin tức
    var catNewHome = await Catnew.findOne({ home: 1 })
        // Danh sách tin tức hiên thị cùng danh mục
    var newHome = await New.find({ _id: { $in: catNewHome.arr_id_product } }).populate('imageNumber')
    //res.send(catproducts)
    res.render('frontend/home/index', {
        urlRoot: req.protocol + 's://' + req.get('host'),
        classBody: 'index-opt-2',
        title: settings.name,
        products: products, // Tất cả sản phẩm
        settings: settings, // Cấu hình chung
        menu: datamenu, // Hiển thị menu đầu trang
        catproducts_sidebar: catproducts_sidebar, // Hiển thị danh mục slider đầu trang
        datamenuservice: datamenuservice,
        datamenuBottom: datamenuBottom, // Hiển thị menu chân trang
        datamenuBottom1: datamenuBottom1, // Hiển thị menu chân trang 1
        datamenuBottom2: datamenuBottom2, // Hiển thị menu chân trang 2
        datamenupartner: datamenupartner, // Hiển thị menu đối tác chân trang
        catproducts: catproducts, // Danh mục trang chủ
        sliderHome: sliderHome, // Slider trang chủ
        listProductStype: listProductStype, // Danh sách loại sản phẩm
        styleProductHome: styleProductHome, // Loại sản phẩm hiển thị đầu trang chủ
        catNewHome: catNewHome,
        newHome: newHome,
    })
})
router.get('/export_order', csrfProtection, function(req, res, next){
  //res.send(datatest)
  // You can define styles as json object
  const styles = {
    headerDark: {
      fill: {
        fgColor: {
          rgb: 'FF000000'
        }
      },
      font: {
        color: {
          rgb: 'FF000000'
        },
        sz: 14,
        bold: true,
        underline: true
      }
    },
    cellPink: {
      fill: {
        fgColor: {
          rgb: 'FFFFCCFF'
        }
      }
    },
    cellGreen: {
      fill: {
        fgColor: {
          rgb: 'FF00FF00'
        }
      }
    }
  };

  var maxColumn = 6;
  const excelData = [
                      [
                        {value: 'a1', style: styles.headerDark},
                        {value: 'b1', style: styles.headerDark},
                        {value: 'c1', style: styles.headerDark}
                      ],
                      ['a2', 'b2', 'c2'] // <-- It can be only values
                    ]
  const dataset = [
    {customer_name: 'IBM', status_id: 1, note: 'some note', misc: 'not shown'},
    {customer_name: 'HP', status_id: 0, note: 'some note'},
    {customer_name: 'MS', status_id: 0, note: 'some note', misc: 'not shown'}
  ]

  // Define an array of merges. 1-1 = A:1
  // The merges are independent of the data.
  // A merge will overwrite all data _not_ in the top-left cell.
  const merges = [
    { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
    { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
    { start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
  ]
  let currentRow = 1
  datatest.items.forEach((itemProduct)=>{


    excelData.push(
      {
        value: "Sản phẩm",
        style: styles.cellPink
      },
      {
        value: "Thuộc tính",
        style: styles.cellPink
      },
      {
        value: "Số lượng",
        style: styles.cellPink
      },
      {
        value: "Đơn giá",
        style: styles.cellPink
      },
      {
        value: "Thành tiền",
        style: styles.cellPink
      },
      {
        value: "Ghi chú",
        style: styles.cellPink
      },
    )
    merges.push(
      {
        start: { row: currentRow, column: 1 },
        end: { row: currentRow, column: maxColumn }
      }
    )
    currentRow++
  })
  //res.send(merges)
  // Create the excel report.
  // This function will return Buffer
  const report = excel.buildExport(
    [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
      {
        name: 'Report', // <- Specify sheet name (optional)
        heading: excelData, // <- Raw heading array (optional)
        merges: merges, // <- Merge cell ranges
        specification: [], // <- Repo specification
        data: dataset // <-- Report data
      }
    ]
  );

  // You can then return this straight
  res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers)
  return res.send(report);

  // OR you can save this buffer to the disk by creating a file.
})
router.post('/hanhtrinhvandon', async function(req, res, next) {
  res.send(req.body)
})
router.post('/backupdatamongo', async function(req, res, next) {

})
router.get('/add-to-cart/:id', csrfProtection, function(req, res, next) {
    var productId = req.params.id
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} })
    Product.findById(productId, function(err, product) {
        if (err) {
          //res.send(err)
          return res.send(err)
            //return res.redirect('/')
        }
        cart.add(product, product._id,'')
        req.session.cart = cart
        res.send(cart)
        //res.redirect('back')
    })
})
router.post('/update-item-cart/:id', function(req, res, next) {
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} })
    //res.send(cart)
    var productId = req.body.id
    var qty = req.body.qty
    Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect('back')
        }
        cart.update(product, product._id, qty)
        req.session.cart = cart
        console.log(req.session.cart)
        res.redirect('back')
    })
})
router.get('/confirm/:token_confirm', csrfProtection, async function(req, res, next){
  var itemUser = await Users.findOne({token_confirm: req.params.token_confirm})
  if(itemUser){
    var datas = await Users.findByIdAndUpdate(itemUser._id, { $set: { active: 1 } }, { new: true })
  }
  return res.redirect('/users/signin')
})
router.get('/testvandon', csrfProtection, async function(req, res, next){
  var datav = {
        "ORDER_NUMBER" : "12",
        "GROUPADDRESS_ID" : 5818802,
        "CUS_ID" : 722,
        "DELIVERY_DATE" : "11/10/2018 15:09:52",
        "SENDER_FULLNAME" : "Yanme Shop",
        "SENDER_ADDRESS" : "Số 5A ngách 22 ngõ 282 Kim Giang, Đại Kim, Quận Hoàng Mai, Hà Nội",
        "SENDER_PHONE" : "0967.363.789",
        "SENDER_EMAIL" : "vanchinh.libra@gmail.com",
        "SENDER_WARD" : 0,
        "SENDER_DISTRICT" : 4,
        "SENDER_PROVINCE" : 1,
        "SENDER_LATITUDE" : 0,
        "SENDER_LONGITUDE" : 0,
        "RECEIVER_FULLNAME" : "Hoàng - Test",
        "RECEIVER_ADDRESS" : "1 NKKN P.Nguyễn Thái Bình, Quận 1, TP Hồ Chí Minh",
        "RECEIVER_PHONE" : "0907882792",
        "RECEIVER_EMAIL" : "hoangnh50@fpt.com.vn",
        "RECEIVER_WARD" : 0,
        "RECEIVER_DISTRICT" : 43,
        "RECEIVER_PROVINCE" : 2,
        "RECEIVER_LATITUDE" : 0,
        "RECEIVER_LONGITUDE" : 0,
        "PRODUCT_NAME" : "Máy xay sinh tố Philips HR2118 2.0L ",
        "PRODUCT_DESCRIPTION" : "Máy xay sinh tố Philips HR2118 2.0L ",
        "PRODUCT_QUANTITY" : 1,
        "PRODUCT_PRICE" : 2292764,
        "PRODUCT_WEIGHT" : 40000,
        "PRODUCT_LENGTH" : 38,
        "PRODUCT_WIDTH" : 24,
        "PRODUCT_HEIGHT" : 25,
        "PRODUCT_TYPE" : "HH",
        "ORDER_PAYMENT" : 3,
        "ORDER_SERVICE" : "VCN",
        "ORDER_SERVICE_ADD" : "",
        "ORDER_VOUCHER" : "",
        "ORDER_NOTE" : "cho xem hàng, không cho thử",
        "MONEY_COLLECTION" : 2292764,
        "MONEY_TOTALFEE" : 0,
        "MONEY_FEECOD" : 0,
        "MONEY_FEEVAS" : 0,
        "MONEY_FEEINSURRANCE" : 0,
        "MONEY_FEE" : 0,
        "MONEY_FEEOTHER" : 0,
        "MONEY_TOTALVAT" : 0,
        "MONEY_TOTAL" : 0,
        "LIST_ITEM" : [
          {
            "PRODUCT_NAME" : "Máy xay sinh tố Philips HR2118 2.0L ",
            "PRODUCT_PRICE" : 2150000,
            "PRODUCT_WEIGHT" : 2500,
            "PRODUCT_QUANTITY" : 1
          }
        ]
      }
  var config = {
    method: 'post',
    url: 'https://partner.viettelpost.vn/v2/order/createOrder',
    data: datav,
    headers: {
      'Content-Type': 'application/json',
      'Token': req.session.tokenLoginViettel
     }
  }
  let instance = await axios(config)
  res.send({
    status: 1,
    result: instance.data
  })
})
router.get('/testsendmail', csrfProtection, async function(req, res, next){
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
          user: "hokien1992@gmail.com", // generated ethereal user
          pass: "drloytkqpliwwzwd" // generated ethereal password
      }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
      from: '"Fred Foo 👻" hokien1992@gmail.com', // sender address
      to: "hokien1992@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>" // html body
  });
  res.send(info)
})
router.get('/checkShipAll', csrfProtection, async function(req, res, next){
  if(req.session.tokenLoginViettel){
    var datav = {
      "SENDER_PROVINCE" : 2,
      "SENDER_DISTRICT" : 53,
      "RECEIVER_PROVINCE" : 39,
      "RECEIVER_DISTRICT" : 449,
      "PRODUCT_TYPE" : "HH",
      "PRODUCT_WEIGHT" : 500,
      "PRODUCT_PRICE" : 5000000,
      "MONEY_COLLECTION" : "5000000",
      "TYPE" :1
    }
    var config = {
      method: 'post',
      url: 'https://partner.viettelpost.vn/v2/order/getPriceAll',
      data: datav,
      headers: {
        'Content-Type': 'application/json',
        'Token': req.session.tokenLoginViettel
       }
    }
    let instance = await axios(config)
    res.send({
      status: 1,
      result: instance.data
    })
  }else{
    res.send({
      status: 0,
      messenger: "Không lấy được dữ liệu"
    })
  }
})
router.post('/deleteAddress', async function(req, res, next){
    Address.findByIdAndRemove(req.body.idAddress, (err, post) => {
      res.redirect('back')
    })
})
router.post('/updateActiveAddress/:id', async function(req, res, next){
  var allAddress = await Address.find({user_id: req.user._id})
  for(i=0;i<allAddress.length;i++){
    var dataReset = await Address.findByIdAndUpdate(allAddress[i]._id, { $set: {
      active: 0,
    } }, { new: true }, function(err, results) {
      return results
    })
  }
  var datas = await Address.findByIdAndUpdate(req.params.id, { $set: { active: 1 } }, { new: true })
  res.send(datas)
})
router.post('/addAddress', async function(req, res, next){
  var data= req.body
  var itemProvince = await Location.findOne({PROVINCE_ID: data.province, PROVINCE_NAME: { $exists: true }})
  var itemDistrict = await Location.findOne({DISTRICT_ID: data.district, DISTRICT_NAME: { $exists: true }})
  var itemWards = await Location.findOne({WARDS_ID: data.wards})
  var address = data.house + ', ' + itemWards.WARDS_NAME + ', ' + itemDistrict.DISTRICT_NAME + ', ' + itemProvince.PROVINCE_NAME
  data.address = address
  data.user_id = req.user._id
  data.active = 0
  var post = new Address(data)
    post.save(function(err, newPost){
      res.redirect('back')
    })
})
router.post('/saveAddressCustomer', async function(req, res, next){
  var data = req.body
  var itemCountry = await Location.findOne({COUNTRY_ID: data.country, COUNTRY_NAME: { $exists: true }})
  var itemProvince = await Location.findOne({PROVINCE_ID: data.province, PROVINCE_NAME: { $exists: true }})
  var itemProvince = await Location.findOne({PROVINCE_ID: data.province, PROVINCE_NAME: { $exists: true }})
  var itemDistrict = await Location.findOne({DISTRICT_ID: data.district, DISTRICT_NAME: { $exists: true }})
  var itemWards = await Location.findOne({WARDS_ID: data.wards})
  var address = data.house + ', ' + itemWards.WARDS_NAME + ', ' + itemDistrict.DISTRICT_NAME + ', ' + itemProvince.PROVINCE_NAME +', '+ itemCountry.name
if(req.session.addressCustomer){
  delete req.session.addressCustomer
  var sessData = req.session
  sessData.addressCustomer = {
    country: req.body.country,
    province: req.body.province,
    district: req.body.district,
    wards: req.body.wards,
    house: req.body.house,
    address: address
  }
}else{
  var sessData = req.session
  sessData.addressCustomer = {
    country: req.body.country,
    province: req.body.province,
    district: req.body.district,
    wards: req.body.wards,
    house: req.body.house,
    address: address
  }
}
if(req.user){
  const data = {
    user_id: req.user._id,
    active: 1,
    country: req.body.country,
    province: req.body.province,
    district: req.body.district,
    wards: req.body.wards,
    house: req.body.house,
    address: address
  }
  var post = new Address(data)
      post.save(function(err, newPost){
        return newPost
      })
  //res.send(post)
}
  res.redirect('/gio-hang')
})
router.get('/checkShip', csrfProtection, async function(req, res, next){
  var datav = {
    "PRODUCT_WEIGHT":7500,
    "PRODUCT_PRICE":5000,
    "MONEY_COLLECTION":0,
    "ORDER_SERVICE_ADD":"",
    "ORDER_SERVICE":"VCN",
    "SENDER_PROVINCE":"1",
    "SENDER_DISTRICT":"14",
    "RECEIVER_PROVINCE":"2",
    "RECEIVER_DISTRICT":"43",
    "PRODUCT_TYPE":"HH",
    "NATIONAL_TYPE":1
  }
  var config = {
    method: 'post',
    url: 'https://partner.viettelpost.vn/v2/order/getPrice',
    data: datav,
    headers: {
      'Content-Type': 'application/json',
      'Token': 'eyJhbGciOiJFUzI1NiJ9.eyJVc2VySWQiOjcwNTQ4ODcsIkZyb21Tb3VyY2UiOjUsIlRva2VuIjoiUjFQUVpCMUZUUUUiLCJleHAiOjE2NjE0NjM1ODksIlBhcnRuZXIiOjcwNTQ4ODd9.PFkBCIXyVV40sMoXnh5fjOz09w038QTW1-pt4mmOLKX3WPvGt6VdagERO7fRBzkWCdJTQ7mH9Nv7SrL-zLqBBQ',
     }
  }
  let instance = await axios(config)
  res.send(instance.data.data)
})
router.get('/checkout-cart', csrfProtection, async function(req, res, next) {

  //Cấu hình hệ thống
  var settings = await Setting.findOne({ lang: "index" }).populate('logo').populate('favicon')
  //Hiển thị menu hình thức thanh toán
  var datamenutypepayment = await Menu.find({ keyname: "type_payment", parent_id: null }).sort({ sort: -1 })
  //Hiển thị menu top
  var datamenu = await Menu.find({ keyname: "menu_top", parent_id: null }).sort({ sort: -1 })
  //Hiển thị menu chân trang
  var datamenuBottom = await Menu.find({ keyname: "menu_bottom", parent_id: null })
  if (datamenuBottom.length > 0) {
      for (i = 0; i < datamenuBottom.length; i++) {
          datamenuBottom[i].children = await Menu.find({ parent_id: datamenuBottom[i]._id })
          if (datamenuBottom[i].children.length > 0) {
              for (j = 0; j < datamenuBottom[i].children.length; j++) {
                  datamenuBottom[i].children[j].children = await Menu.find({ parent_id: datamenuBottom[i].children[j]._id })
              }
          }
      }
  }
  //Hiển thị menu chân trang 1
  var datamenuBottom1 = await Menu.find({ keyname: "menu_footer1", parent_id: null })
  if (datamenuBottom1.length > 0) {
      for (i = 0; i < datamenuBottom1.length; i++) {
          datamenuBottom1[i].children = await Menu.find({ parent_id: datamenuBottom1[i]._id })
          if (datamenuBottom1[i].children.length > 0) {
              for (j = 0; j < datamenuBottom1[i].children.length; j++) {
                  datamenuBottom1[i].children[j].children = await Menu.find({ parent_id: datamenuBottom1[i].children[j]._id })
              }
          }
      }
  }
  //Hiển thị menu chân trang 1
  var datamenuBottom2 = await Menu.find({ keyname: "menu_footer2", parent_id: null })
  if (datamenuBottom2.length > 0) {
      for (i = 0; i < datamenuBottom2.length; i++) {
          datamenuBottom2[i].children = await Menu.find({ parent_id: datamenuBottom2[i]._id })
          if (datamenuBottom2[i].children.length > 0) {
              for (j = 0; j < datamenuBottom2[i].children.length; j++) {
                  datamenuBottom2[i].children[j].children = await Menu.find({ parent_id: datamenuBottom2[i].children[j]._id })
              }
          }
      }
  }
  //Hiển thị menu đối tác chânh trang
  var datamenupartner = await Menu.find({ keyname: "partner_bottom", parent_id: null }).sort({ sort: 1 })
  if (datamenupartner.length > 0) {
      for (i = 0; i < datamenupartner.length; i++) {
        datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
        if (datamenupartner[i].children.length > 0) {
          for (j = 0; j < datamenupartner[i].children.length; j++) {
            datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
          }
        }
      }
  }
  var country = await Location.aggregate([
    { $match : { COUNTRY_NAME : { $exists: true }} },
    { $project: {
          "_id": "$_id",
          "name": "$COUNTRY_NAME",
          "code": "$COUNTRY_CODE",
          "country_id": "$COUNTRY_ID",
          "label": "$COUNTRY_NAME",
          "id": "$COUNTRY_ID",
          "idcountry": "$COUNTRY_ID",
          "value": "$COUNTRY_ID",
      }
    }
  ])
  var messages = req.flash('error')
  var carts = new Cart(req.session.cart ? req.session.cart : { items: {} })

  var percent = 0
  var commission = 0
  var infocustomer = {
    name: '',
    phone: '',
    email: '',
    country: '',
    province: 0,
    district: 0,
    wards: 0,
    level: 0,
    address: '',
  }
  var checkLocation = {
    province: 0,
    district: 0,
    wards: 0,
  }
  var itemUser = {}
  var priceShip = 0
  var timeShip = 0
  var listAddress = []

  if(req.user){
    itemUser = await Users.findOne({_id: req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
    infocustomer.name = req.user.name
    infocustomer.phone = req.user.phone
    infocustomer.email = req.user.email
    infocustomer.address = req.user.address
    infocustomer.province = req.user.province
    infocustomer.district = req.user.district
    infocustomer.wards = req.user.wards
    if(req.user.level==1){
      percent = 80
    }


    checkLocation = {
      province: req.user.province,
      district: req.user.district,
      wards: req.user.wards
    }
      // Hiển thị giá ship
    if(req.session.tokenLoginViettel){
      var itemAddress = await Address.findOne({
        active: 1,
        user_id: req.user._id
      })
      var provinceReceiver = req.user.province
      var districtReceiver = req.user.district
      if(itemAddress){
        provinceReceiver = itemAddress.province
        districtReceiver = itemAddress.district
      }
      var datav = {
          "SENDER_PROVINCE" : 1,
          "SENDER_DISTRICT" : 30,
          "RECEIVER_PROVINCE" : provinceReceiver,
          "RECEIVER_DISTRICT" : districtReceiver,
          "PRODUCT_TYPE" : "HH",
          "PRODUCT_WEIGHT" : carts.weight,
          "PRODUCT_PRICE" : carts.totalPrice,
          "MONEY_COLLECTION" : "0",
          "TYPE" :1
      }
      var config = {
          method: 'post',
          url: 'https://partner.viettelpost.vn/v2/order/getPriceAll',
          data: datav,
          headers: {
              'Content-Type': 'application/json',
              'Token': req.session.tokenLoginViettel
          }
      }
      let instance = await axios(config)
      priceShip = instance.data[0].GIA_CUOC
      timeShip = instance.data[0].THOI_GIAN
    }
    var listAddress = await Address.find({user_id: req.user._id})
  }else{
    var datav = {
    "USERNAME": "ceo@weon.vn",
    "PASSWORD": "Anhdoan123"
    }
    var config = {
      method: 'post',
      url: 'https://partner.viettelpost.vn/v2/user/Login',
      data: datav,
      headers: {
        'Content-Type': 'application/json',
       }
    }
    let instance = await axios(config)
    var sessData = req.session
    sessData.tokenLoginViettel = instance.data.data.token

    if(req.session.addressCustomer){
      var datav = {
          "SENDER_PROVINCE" : 1,
          "SENDER_DISTRICT" : 30,
          "RECEIVER_PROVINCE" : req.session.addressCustomer.province,
          "RECEIVER_DISTRICT" : req.session.addressCustomer.district,
          "PRODUCT_TYPE" : "HH",
          "PRODUCT_WEIGHT" : carts.weight,
          "PRODUCT_PRICE" : carts.totalPrice,
          "MONEY_COLLECTION" : "0",
          "TYPE" :1
      }
      var config = {
          method: 'post',
          url: 'https://partner.viettelpost.vn/v2/order/getPriceAll',
          data: datav,
          headers: {
              'Content-Type': 'application/json',
              'Token': req.session.tokenLoginViettel
          }
      }
      let instance = await axios(config)
      priceShip = instance.data[0].GIA_CUOC
      timeShip = instance.data[0].THOI_GIAN
    }else{
      priceShip = instance.data[0].GIA_CUOC
      timeShip = instance.data[0].THOI_GIAN
    }
  }
  var infoShip = {
    priceShip: priceShip,
    timeShip: timeShip
  }
  // res.send(infoShip)
  var checkEpayOrder = 1
  var totalPriceAll = parseFloat(carts.totalPrice)+parseFloat(infoShip.priceShip)
  var commission = Math.round(1.25*0.8*carts.totalPrice/4800 * 1000)/1000
  var totalEpay = Math.round(1.25*carts.totalPrice/4800 * 1000)/1000
  var checkAddress = 0
  var addressCustomer = {
    address: ''
  }
  if(req.session.addressCustomer){
    checkAddress = 1
    addressCustomer = req.session.addressCustomer
  }
  res.render('frontend/order/checkout', {
      title: 'Nhập thông tin khách hàng',
      classBody: 'catalog-view_op1',
      urlRoot: req.protocol + 's://' + req.get('host'),
      csrfToken: req.csrfToken(),
      settings: settings,
      menu: datamenu,
      datamenuBottom: datamenuBottom,
      datamenuBottom1: datamenuBottom1,
      datamenuBottom2: datamenuBottom2,
      datamenupartner: datamenupartner,
      datamenutypepayment: datamenutypepayment,
      country: country,
      carts: carts,
      discount: commission,
      infocustomer: infocustomer,
      checkLocation: checkLocation,
      itemUser: itemUser,
      infoShip: infoShip,
      checkEpayOrder: checkEpayOrder,
      listAddress: listAddress,
      checkAddress: checkAddress,
      addressCustomer: addressCustomer,
      totalEpay: totalEpay
  })
})
router.get('/gio-hang', csrfProtection, async function(req, res, next) {
  //res.send({test: 'iokok'})
  //res.send(JSON.parse(req.session.cart.items))
  var tokens = await req.csrfToken()
      //Cấu hình hệ thống
  var settings = await Setting.findOne({ lang: "index" }).populate('logo').populate('favicon')
      //Hiển thị menu top
  var datamenu = await Menu.find({ keyname: "menu_top", parent_id: null })
      //Hiển thị menu chân trang
  var datamenuBottom = await Menu.find({ keyname: "menu_bottom", parent_id: null })
  if (datamenuBottom.length > 0) {
    for (i = 0; i < datamenuBottom.length; i++) {
      datamenuBottom[i].children = await Menu.find({ parent_id: datamenuBottom[i]._id })
      if (datamenuBottom[i].children.length > 0) {
        for (j = 0; j < datamenuBottom[i].children.length; j++) {
          datamenuBottom[i].children[j].children = await Menu.find({ parent_id: datamenuBottom[i].children[j]._id })
        }
      }
    }
  }
  //Hiển thị menu chân trang 1
  var datamenuBottom1 = await Menu.find({ keyname: "menu_footer1", parent_id: null })
  if (datamenuBottom1.length > 0) {
    for (i = 0; i < datamenuBottom1.length; i++) {
      datamenuBottom1[i].children = await Menu.find({ parent_id: datamenuBottom1[i]._id })
      if (datamenuBottom1[i].children.length > 0) {
        for (j = 0; j < datamenuBottom1[i].children.length; j++) {
          datamenuBottom1[i].children[j].children = await Menu.find({ parent_id: datamenuBottom1[i].children[j]._id })
        }
      }
    }
  }
  //Hiển thị menu chân trang 1
  var datamenuBottom2 = await Menu.find({ keyname: "menu_footer2", parent_id: null })
  if (datamenuBottom2.length > 0) {
      for (i = 0; i < datamenuBottom2.length; i++) {
          datamenuBottom2[i].children = await Menu.find({ parent_id: datamenuBottom2[i]._id })
          if (datamenuBottom2[i].children.length > 0) {
              for (j = 0; j < datamenuBottom2[i].children.length; j++) {
                  datamenuBottom2[i].children[j].children = await Menu.find({ parent_id: datamenuBottom2[i].children[j]._id })
              }
          }
      }
  }
  //Hiển thị menu đối tác chân trang
  var datamenupartner = await Menu.find({ keyname: "partner_bottom", parent_id: null }).populate('imageNumber').sort({ sort: 1 })
  if (datamenupartner.length > 0) {
    for (i = 0; i < datamenupartner.length; i++) {
      datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
      if (datamenupartner[i].children.length > 0) {
        for (j = 0; j < datamenupartner[i].children.length; j++) {
          datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
        }
      }
    }
  }
  var country = await Location.aggregate([
    { $match : { COUNTRY_NAME : { $exists: true }} },
    { $project: {
          "_id": "$_id",
          "name": "$COUNTRY_NAME",
          "code": "$COUNTRY_CODE",
          "country_id": "$COUNTRY_ID",
          "label": "$COUNTRY_NAME",
          "id": "$COUNTRY_ID",
          "idcountry": "$COUNTRY_ID",
          "value": "$COUNTRY_ID",
      }
    }
  ])

  var messages = req.flash('error')
  var carts = new Cart(req.session.cart ? req.session.cart : { items: [] })
  var priceShip = 0
  var timeShip = 0
  var itemUser = {}
  var checkAddress = 0
//res.send(req.session.addressCustomer)
  if(req.user){
    checkAddress = 1
    const itemUser = await Users.findOne({_id: req.user._id})
    const itemAddress = await Address.findOne({active: 1, user_id: itemUser._id})
    // Hiển thị giá ship
    if(req.session.tokenLoginViettel){
      if(itemAddress){
        var datav = {
            "SENDER_PROVINCE" : 1,
            "SENDER_DISTRICT" : 30,
            "RECEIVER_PROVINCE" : itemAddress.province,
            "RECEIVER_DISTRICT" : itemAddress.district,
            "PRODUCT_TYPE" : "HH",
            "PRODUCT_WEIGHT" : carts.weight,
            "PRODUCT_PRICE" : carts.totalPrice,
            "MONEY_COLLECTION" : "0",
            "TYPE" :1
        }
        var config = {
            method: 'post',
            url: 'https://partner.viettelpost.vn/v2/order/getPriceAll',
            data: datav,
            headers: {
                'Content-Type': 'application/json',
                'Token': req.session.tokenLoginViettel
            }
        }
        let instance = await axios(config)
        priceShip = instance.data[0].GIA_CUOC
        timeShip = instance.data[0].THOI_GIAN
      }else{
        if(itemUser.country!=0&&itemUser.province&&itemUser.district!=0){
          var datav = {
              "SENDER_PROVINCE" : 1,
              "SENDER_DISTRICT" : 30,
              "RECEIVER_PROVINCE" : itemUser.province,
              "RECEIVER_DISTRICT" : itemUser.district,
              "PRODUCT_TYPE" : "HH",
              "PRODUCT_WEIGHT" : carts.weight,
              "PRODUCT_PRICE" : carts.totalPrice,
              "MONEY_COLLECTION" : "0",
              "TYPE" :1
          }
          var config = {
              method: 'post',
              url: 'https://partner.viettelpost.vn/v2/order/getPriceAll',
              data: datav,
              headers: {
                  'Content-Type': 'application/json',
                  'Token': req.session.tokenLoginViettel
              }
          }
          let instance = await axios(config)
          priceShip = instance.data[0].GIA_CUOC
          timeShip = instance.data[0].THOI_GIAN
        }
      }
    }
  }else{
    var datavt = {
    "USERNAME": "ceo@weon.vn",
    "PASSWORD": "Anhdoan123"
    }
    var config = {
      method: 'post',
      url: 'https://partner.viettelpost.vn/v2/user/Login',
      data: datavt,
      headers: {
        'Content-Type': 'application/json',
       }
    }
    let instances = await axios(config)
    var sessDatas = req.session
    sessDatas.tokenLoginViettel = instances.data.data.token

    if(req.session.tokenLoginViettel){
      if(req.session.addressCustomer){
        checkAddress = 1
        var datav = {
            "SENDER_PROVINCE" : 1,
            "SENDER_DISTRICT" : 30,
            "RECEIVER_PROVINCE" : req.session.addressCustomer.province,
            "RECEIVER_DISTRICT" : req.session.addressCustomer.district,
            "PRODUCT_TYPE" : "HH",
            "PRODUCT_WEIGHT" : carts.weight,
            "PRODUCT_PRICE" : carts.totalPrice,
            "MONEY_COLLECTION" : "0",
            "TYPE" :1
        }
        var config = {
            method: 'post',
            url: 'https://partner.viettelpost.vn/v2/order/getPriceAll',
            data: datav,
            headers: {
                'Content-Type': 'application/json',
                'Token': req.session.tokenLoginViettel
            }
        }
        let instance = await axios(config)
        priceShip = instance.data[0].GIA_CUOC
        timeShip = instance.data[0].THOI_GIAN
      }else{
        checkAddress = 0
      }
    }
  }
  var infoShip = {
    priceShip: priceShip,
    timeShip: timeShip
  }
  res.render('frontend/order/cart', {
    title: 'Giỏ hàng',
    csrfToken: tokens,
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    datamenuBottom1: datamenuBottom1,
    datamenuBottom2: datamenuBottom2,
    datamenupartner: datamenupartner, // Hiển thị menu đối tác chân trang
    carts: carts,
    infoShip: infoShip,
    itemUser: itemUser,
    country: country,
    checkAddress: checkAddress,
  })
})
router.get('/reset/emailUser', csrfProtection,async function(req, res, next){
  var data = await Users.find({})
  //console.log(Date.now)
  //var text = "HoKien199@gmail.com"
  for(i=0;i<data.length;i++){
    //var email = data[i].email
    var dataReset = await Users.findByIdAndUpdate(data[i]._id, { $set: {
          name: data[i].firstname+' '+data[i].lastname,
        } }, { new: true }, function(err, results) {
          return results
    })
  }
  res.send({message: dataReset})
})
router.get('/reset/walletUser', csrfProtection,async function(req, res, next){
  var data = await Users.find({})
  for(i=0;i<data.length;i++){
    var dataw = {
      w_commission: 0,
      w_epay: 0,
      w_milestones: 0,
      w_totalcommisstion: 0
    }
    var dataw2 = {
      w_commission: 0,
      w_epay: 0,
      w_milestones: 0,
      w_totalcommisstion: 0
    }
    var dataw3 = {
      w_commission: 0,
      w_epay: 0,
      w_milestones: 0,
      w_totalcommisstion: 0
    }
    var datapost = new Wallet(dataw)
    var dataReset = await datapost.save(function(err, results) {
      return results
    })
    var datapost2 = new Wallet2(dataw2)
    var dataReset2 = await datapost2.save(function(err, results) {
      return results
    })
    var datapost3 = new Wallet3(dataw3)
    var dataReset3 = await datapost3.save(function(err, results) {
      return results
    })
    var dataResetUse = await Users.findByIdAndUpdate(data[i]._id, { $set: {
          wallet_id: datapost._id,
          wallet_id2: datapost2._id,
          wallet_id3: datapost3._id,
        } }, { new: true }, function(err, results) {
        return results
    })
  }
  res.send({message: "ok"})
})
router.get('/reset/product', csrfProtection,async function(req, res, next){
  var data = await Product.find({})
  for(i=0;i<data.length;i++){
    var percent = 0;
    if(data[i].price_sale!=0){
      var pri = parseInt(data[i].price_sale)
    }else{
      var pri = parseInt(data[i].price)
    }
    var epay = Math.round(1.25*pri/4800 * 1000)/1000
    var dataReset = await Product.findByIdAndUpdate(data[i]._id, { $set: {
            epay: epay,
        } }, { new: true }, function(err, results) {
        return results
    })
  }
  res.send({ok :"ok"})
})
router.get('/reset/exchange',async function(req, res, next){
  var data = await Exchange.find({})
  for(i=0;i<data.length;i++){
    Exchange.findByIdAndRemove(data[i]._id, (err, post) => {
      return post
    })
  }
  res.send({ok :"ok"})
})
router.get('/reset/updatewallet', csrfProtection,async function(req, res, next){
  var data = await Wallet.find({})
  var dataw = {
    w_commission: 0,
    w_epay: 0,
    w_milestones: 0,
    w_totalcommisstion: 0
  }
  var dataw2 = {
    w_commission: 0,
    w_epay: 0,
    w_milestones: 0,
    w_totalcommisstion: 0
  }
  var dataw3 = {
    w_commission: 0,
    w_epay: 0,
    w_milestones: 0,
    w_totalcommisstion: 0
  }
  for(i=0;i<data.length;i++){
    var data11 = await Wallet.findByIdAndUpdate(data[i]._id, { $set: dataw }, { new: true }, function(err, results) {
      return results
    })
  }
  var data2 = await Wallet2.find({})
  for(i=0;i<data2.length;i++){
    var data22 = await Wallet2.findByIdAndUpdate(data2[i]._id, { $set: dataw }, { new: true }, function(err, results) {
      return results
    })
  }
  var data3 = await Wallet3.find({})
  for(i=0;i<data3.length;i++){
    var data33 = await Wallet3.findByIdAndUpdate(data3[i]._id, { $set: dataw }, { new: true }, function(err, results) {
      return results
    })
  }
  res.send({
    data11:data11,
    data22:data22,
    data33: data33
  })
})
router.get('/reset/wallet', csrfProtection,async function(req, res, next){
  var data = await Wallet.find({})
  for(i=0;i<data.length;i++){
    var data1 = await Wallet.findByIdAndRemove(data[i]._id, (err, post) => {
        return "ok"
    });
  }
  var data2 = await Wallet2.find({})
  for(i=0;i<data2.length;i++){
    var data22 = await Wallet2.findByIdAndRemove(data2[i]._id, (err, post) => {
        return "ok"
    });
  }
  var data3 = await Wallet3.find({})
  for(i=0;i<data3.length;i++){
    var data33 = await Wallet3.findByIdAndRemove(data3[i]._id, (err, post) => {
        return "ok"
    });
  }
  res.send({
    data1:data1,
    data22:data22,
    data33: data33
  })
})

router.get('/updateEpay', async function(req, res, next){
  var dataUser = await Users.find({}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  for(i=0; i<dataUser.length; i++){
    var w_epay1 = parseFloat(dataUser[i].wallet_id2.w_epay)*0.002+parseFloat(dataUser[i].wallet_id.w_epay)
    var w_epay2 = parseFloat(dataUser[i].wallet_id2.w_epay)-parseFloat(dataUser[i].wallet_id2.w_epay)*0.002
    var dataWallet1 = await Wallet.findByIdAndUpdate(dataUser[i].wallet_id._id, { $set: {
      w_epay: parseFloat(w_epay1).toFixed(3),
    } }, { new: true }, function(err, results) {
      return results
    })
    var dataWallet2 = await Wallet2.findByIdAndUpdate(dataUser[i].wallet_id2._id, { $set: {
      w_epay: parseFloat(w_epay2).toFixed(3),
    } }, { new: true }, function(err, results) {
      return results
    })
  }
  res.send(dataUser)
})
router.get('/check_update_wallet', async function(req, res, next){
  var dataUser = await Users.find({}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('wallet_id4').populate('wallet_id5').populate('wallet_id6')
  for(i=0; i<dataUser.length; i++){
    var itemdataUser = await Users.findByIdAndUpdate(dataUser[i]._id, { $set: {
      check_update_wallet: 0
    } }, { new: true }, function(err, results) {
      return results
    })
  }
  res.send(itemdataUser)
})
router.get('/updateUser', csrfProtection, async function(req, res, next){
  var filter = {}
  filter.$or = [{introduce: 'admin'}, {introduce: ''}]
  var dataUser = await Users.find(filter)
  for(i=0; i<dataUser.length; i++){
    var dataWallet1 = await Users.findByIdAndUpdate(dataUser[i]._id, { $set: {introduce: 'vietnamepay', parent_id: "5df5a6ddc1266804a67b1087"} }, { new: true }, function(err, results) {
      return results
    })
  }
  res.send(dataWallet1)
})
// Tìm kiếm sản phẩm
router.get('/search', csrfProtection, searchController.search)
router.get('/addCart', csrfProtection, orderController.addCart)
router.get('/removeItemCart', csrfProtection, orderController.removeItemCart )
router.post('/add-order', csrfProtection, orderController.addOrder)
router.get('/sLocation', csrfProtection, locationController.sLocation)
router.get('/success-cart', csrfProtection, orderController.success)

router.get('/:any', csrfProtection, productController.detail, productController.listproduct, newController.list, pageController.detail, newController.detail)
router.get('/:any/:any1', csrfProtection, productController.detail, productController.listproduct, newController.list, pageController.detail, newController.detail)
router.get('/:any/:any1/:any2', csrfProtection, productController.detail, productController.listproduct, newController.list, pageController.detail, newController.detail)
router.get('/:any/:any1/:any2/:any3', csrfProtection, productController.detail, productController.listproduct, newController.list, pageController.detail, newController.detail)
router.get('/:any/:any1/:any2/:any3/:any4', csrfProtection, productController.detail, productController.listproduct, newController.list, pageController.detail, newController.detail)
router.get('/:any/:any1/:any2/:any3/:any4/:any5', csrfProtection, productController.detail, productController.listproduct, newController.list, pageController.detail, newController.detail)
module.exports = router
