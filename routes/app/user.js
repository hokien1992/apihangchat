var express = require('express')
var formidable = require('formidable')
var fs = require('fs')
var multer = require('multer')
var cors = require('cors');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var csurf = require('csurf');
var csrfProtection = csurf({ cookie: true });
var bcrypt = require('bcryptjs')
var passport = require('passport')
var url = require('url')
var nodemailer =  require('nodemailer')
var randomstring = require("randomstring")
var dateTime = require('node-datetime')
var dt = dateTime.create()
var moment = require('moment')
var app = express();

var Setting = require('../models/setting')
var Menu = require('../models/menu')
var Users = require('../models/user')
const Wallet = require('../models/wallet_v1')
const Wallet2 = require('../models/wallet_v2')
const Wallet3 = require('../models/wallet_v3')
const Exchange = require('../models/exchange')
var Order = require('../models/order')
var Location = require('../models/location')
var Banner_affiliate = require('../models/banner_affiliate')
var userController = require('../controllers/frontend/UserController')

//app.use(csrfProtection)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan('dev'));
// Danh sách sản phẩm
app.get('/product', isLoggedIn, userController.listproduct)
// View Thêm sản phẩm
app.get('/product/create', csrfProtection, isLoggedIn, userController.createproduct)
// Thêm sản phẩm
app.post('/product/storeProduct', isLoggedIn, userController.storeProduct)
// Sửa sản phẩm
//app.get('/product/edit/:id', isLoggedIn, userController.editproduct)
// Rút tiền
app.post('/exchange/addnaptien', isLoggedIn, userController.exchangeAddNaptien)
// Rút tiền
app.get('/exchange/ruttien', csrfProtection, isLoggedIn, userController.exchangeRuttien)
// Nạp tiền
app.get('/exchange/move', csrfProtection, isLoggedIn, userController.exchangeMove)
//exchangePostMove
// Nạp tiền
app.post('/exchange/postmove', isLoggedIn, userController.exchangePostMove)
app.get('/exchange/naptien', csrfProtection, isLoggedIn, userController.exchangeNaptien)
// Chuyển đổi sang ví Akie
app.get('/exchange/view-exchange-akie', csrfProtection, isLoggedIn, userController.exchangeViewAkie)
// app giao dịch thanh toán
app.get('/exchange', csrfProtection, isLoggedIn, userController.exchange)
// Lịch sử thanh toán
app.get('/exchange/historyExchange', csrfProtection, isLoggedIn, userController.historyExchange)
// CHi tiết lịch sử thanh toán
app.get('/exchange/detailExchange/:id', csrfProtection, isLoggedIn, userController.detailExchange)
// Chi tiết đơn hàng
app.get('/view-order/:id', csrfProtection, isLoggedIn, userController.viewOrder)
// Lịch sử đơn hàng
app.get('/history-order', csrfProtection, isLoggedIn, userController.historyOrder)
// Affiliate Tracking
app.get('/affiliate-tracking', csrfProtection, isLoggedIn, userController.affiliateTracking)
// banner-affiliate
app.get('/banner-affiliate', csrfProtection, isLoggedIn, userController.affiliateBanner)
// view-add-affiliate
app.get('/add-affiliate-banner', csrfProtection, isLoggedIn, userController.affiliateAddBanner)
app.post('/addBannerAffiliate', isLoggedIn, userController.addBannerAffiliate)
app.post('/removeBannerAffiliate', isLoggedIn, userController.removeBannerAffiliate)
// Liet ke danh sach thanh vien con
app.get('/listUsers', isLoggedIn, csrfProtection, userController.listUsers)
app.post('/updateEpayUser', isLoggedIn, async function(req, res, next){
  var dataUser = await Users.findOne({_id: req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  //res.send(dataUser)
  var w_epay1 = parseFloat(dataUser.wallet_id2.w_epay)*0.002+parseFloat(dataUser.wallet_id.w_epay)
  var w_epay2 = parseFloat(dataUser.wallet_id2.w_epay)-parseFloat(dataUser.wallet_id2.w_epay)*0.002
  var dataWallet1 = await Wallet.findByIdAndUpdate(dataUser.wallet_id._id, { $set: {
    w_epay: Math.round(parseFloat(w_epay1) * 1000)/1000,
  } }, { new: true }, function(err, results) {
    return results
  })
  var dataWallet2 = await Wallet2.findByIdAndUpdate(dataUser.wallet_id2._id, { $set: {
    w_epay: Math.round(parseFloat(w_epay2) * 1000)/1000,
  } }, { new: true }, function(err, results) {
    return results
  })
  var itemdataUser = await Users.findByIdAndUpdate(dataUser._id, { $set: {
    check_update_wallet: 1
  } }, { new: true }, function(err, results) {
    return results
  })
  // Lịch sử giao dịch hàng ngày
  var newPost = new Exchange()
  var dataExchange = await Exchange.find({}).countDocuments()
  if(dataExchange>0){
    var itemExchange = await Exchange.findOne({}).sort( { sort_id: -1 } )
    newPost.sort_id = parseInt(itemExchange.sort_id)+1
  }else{
    newPost.sort_id = 1
  }
  newPost.wallet_id = dataUser.wallet_id._id
  newPost.wallet_id2 = dataUser.wallet_id2._id
  newPost.wallet_id3 = dataUser.wallet_id3._id
  newPost.w_epay = Math.round(parseFloat(dataUser.wallet_id2.w_epay)*0.002 * 1000)/1000
  newPost.w_epay2 = Math.round(parseFloat(dataUser.wallet_id2.w_epay)*0.002 * 1000)/1000
  newPost.w_epay3 = 0
  newPost.w_epay_prefix = "+"
  newPost.w_epay2_prefix = "-"
  newPost.w_epay3_prefix = "+"
  newPost.content = 'Bạn được chuyển '+Math.round(parseFloat(dataUser.wallet_id2.w_epay)*0.002 * 1000)/1000+' từ ví tiết kiệm sang ví tiêu dùng'
  newPost.user_id = dataUser._id
  newPost.code = 'TK'+newPost.sort_id
  newPost.status = 1
  newPost.number_monney = 100
  newPost.number_epay = 100
  newPost.type_exchange = 4
  newPost.hinhthucthanhtoan = 4

  newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
  newPost.math = '+'
  newPost.save(function(err, result){
    return result
  })
  res.redirect('back')
})
// Sửa thông tin cá nhân
app.post('/edit/:id', function(req, res){
  var form = new formidable.IncomingForm()
  form.uploadDir = './public/user'
  form.keepExtensions = true
  form.multiples = false
  form.maxFieldsSize = 1 * 1024 * 1024;
  form.parse(req, function(err, fields, files) {
    var data = fields
    if(files.file.size!=0){
      data.imagePath = files.file.path.substr(6, 1000000000000)
    }
    Users.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
      res.redirect('back')
    })
  })
})
app.get('/viewChangePassword', csrfProtection, isLoggedIn, async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  //Hiển thị menu chân trang
  var datamenuBottom = await Menu.find({keyname:"menu_bottom",parent_id: null})
  if(datamenuBottom.length>0){
    for(i=0; i<datamenuBottom.length; i++){
      datamenuBottom[i].children = await Menu.find({parent_id:datamenuBottom[i]._id})
      if(datamenuBottom[i].children.length>0){
        for(j=0; j<datamenuBottom[i].children.length; j++){
          datamenuBottom[i].children[j].children = await Menu.find({parent_id:datamenuBottom[i].children[j]._id})
        }
      }
    }
  }
  var urlRoot= req.protocol + 's://' + req.get('host')
  var itemDataUser = await Users.findOne({_id:req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  var dataLevel = {
    name: '',
    commission: 0,
  }
  if(itemDataUser){
    if(itemDataUser.level==0){
      dataLevel = {
        name: 'Nhà Phân Phối',
        commission: 60,
      }
    }else if(itemDataUser.level==1){
      dataLevel = {
        name: 'Tổng Đại Lý',
        commission: 50,
      }
    }else if(itemDataUser.level==2){
      dataLevel = {
        name: 'Đại Lý',
        commission: 45,
      }
    }else if(itemDataUser.level==3){
      dataLevel = {
        name: 'Cộng tác viên',
        commission: 20,
      }
    }else if(itemDataUser.level==4){
      dataLevel = {
        name: 'Thành viên',
        commission: 20,
      }
    }
  }
  var messages = await req.flash('error')

  if(req.flash('success').length>0){
    var success = 1
  }else{
    var success = 0
  }
  res.render('frontend/users/changePassword',{ title: 'Thay đổi mật khẩu',
    messages: messages,
    hasErrors: messages.length > 0 ,
    success: success,
    classBody: 'catalog-view_op1',
    csrfToken: req.csrfToken(),
    urlRoot: urlRoot,
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    dataLevel: dataLevel
  })
})
app.post('/changePassword', async function(req, res, done){
  req.checkBody('password', 'Mật khẩu không được bỏ trống').notEmpty()
  req.checkBody('password', 'Mật khẩu không nhỏ hơn 6 ký tự').isLength({min:6})
  req.checkBody('repassword','Mật khẩu phải trùng nhau').equals(req.body.password)
  var errors = req.validationErrors()
  //res.send({errors: bcrypt.hashSync(req.body.password, 8)})
  if(errors){
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    })
    req.flash('error', messages)
    res.redirect('back')
    //return 'ok'
  }else{

    var data = {
      password: bcrypt.hashSync(req.body.password, 8)
    }
    var dataUsers = await Users.findByIdAndUpdate(req.user._id, { $set: data}, { new: true }, function (err, results) {
      return results
    })
    req.flash('success', '1')
    res.redirect('back')
  }

})
//Quan ly thong tin khach hang
app.get('/profile', csrfProtection, isLoggedIn, async function(req, res, next){
  //res.send({test: req.protocol + 's://' + req.get('host')})
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  //Hiển thị menu chân trang
  var datamenuBottom = await Menu.find({keyname:"menu_bottom",parent_id: null})
  if(datamenuBottom.length>0){
      for(i=0; i<datamenuBottom.length; i++){
          datamenuBottom[i].children = await Menu.find({parent_id:datamenuBottom[i]._id})
          if(datamenuBottom[i].children.length>0){
              for(j=0; j<datamenuBottom[i].children.length; j++){
              datamenuBottom[i].children[j].children = await Menu.find({parent_id:datamenuBottom[i].children[j]._id})
              }
          }
      }
  }
  var urlRoot= req.protocol + 's://' + req.get('host')
  var itemDataUser = await Users.findOne({_id:req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  var dataLevel = {
    name: '',
    commission: 0,
  }
  if(itemDataUser){
    if(itemDataUser.level==0){
      dataLevel = {
        name: 'Nhà Phân Phối',
        commission: 60,
      }
    }else if(itemDataUser.level==1){
      dataLevel = {
        name: 'Tổng Đại Lý',
        commission: 50,
      }
    }else if(itemDataUser.level==2){
      dataLevel = {
        name: 'Đại Lý',
        commission: 45,
      }
    }else if(itemDataUser.level==3){
      dataLevel = {
        name: 'Cộng tác viên',
        commission: 20,
      }
    }else if(itemDataUser.level==4){
      dataLevel = {
        name: 'Thành viên',
        commission: 20,
      }
    }
  }
  res.render('frontend/users/profile',{ title: 'Thông tin khách hàng',
    classBody: 'catalog-view_op1',
    csrfToken: req.csrfToken(),
    urlRoot: urlRoot,
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    dataLevel: dataLevel
  })
})
//Quan ly thong tin khach hang
app.get('/dashboard', csrfProtection, isLoggedIn, async function(req, res, next){
  //res.send({test: req.protocol + 's://' + req.get('host')})
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  //Hiển thị menu chân trang
  var datamenuBottom = await Menu.find({keyname:"menu_bottom",parent_id: null})
  if(datamenuBottom.length>0){
    for(i=0; i<datamenuBottom.length; i++){
      datamenuBottom[i].children = await Menu.find({parent_id:datamenuBottom[i]._id})
      if(datamenuBottom[i].children.length>0){
        for(j=0; j<datamenuBottom[i].children.length; j++){
          datamenuBottom[i].children[j].children = await Menu.find({parent_id:datamenuBottom[i].children[j]._id})
        }
      }
    }
  }
  var urlRoot= req.protocol + 's://' + req.get('host')
  var itemDataUser = await Users.findOne({_id:req.user._id}).populate('wallet_id2').populate('wallet_id').populate('wallet_id3')
  var dataLevel = {
    name: '',
    commission: 0,
  }
  if(itemDataUser){
    if(itemDataUser.level==0){
      dataLevel = {
        name: 'Nhà Phân Phối',
        commission: 60,
      }
    }else if(itemDataUser.level==1){
      dataLevel = {
        name: 'Tổng Đại Lý',
        commission: 50,
      }
    }else if(itemDataUser.level==2){
      dataLevel = {
        name: 'Đại Lý',
        commission: 45,
      }
    }else if(itemDataUser.level==3){
      dataLevel = {
        name: 'Cộng tác viên',
        commission: 20,
      }
    }else if(itemDataUser.level==4){
      dataLevel = {
        name: 'Thành viên',
        commission: 20,
      }
    }
  }
  if(req.user.username=='vietnamepay'){
    var countIntroduce = await Users.find({}).countDocuments()-1
  }else{
    var countIntroduce = await Users.find({ arr_parent: { $all: [itemDataUser._id] } }).countDocuments()
  }

  var countOrder = await Order.find({ user_id: req.user._id}).countDocuments()
  //res.send({countOrder: countIntroduce})
  res.render('frontend/users/dashboard',{ title: 'Thông tin khách hàng',
    classBody: 'catalog-view_op1',
    csrfToken: req.csrfToken(),
    urlRoot: urlRoot,
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
    countIntroduce: countIntroduce,
    countOrder: countOrder
  })
})
app.get('/logout', isLoggedIn, function(req, res, next){
  req.logOut();
  res.redirect('/users/signin');
})
app.use('/', notLoggedIn, function(req, res, next){
  next();
})
/* GET users listing. */
app.get('/check-mail', csrfProtection, async function(req, res, next) {
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  //Hiển thị menu chân trang
  var datamenuBottom = await Menu.find({keyname:"menu_bottom",parent_id: null})
  if(datamenuBottom.length>0){
      for(i=0; i<datamenuBottom.length; i++){
          datamenuBottom[i].children = await Menu.find({parent_id:datamenuBottom[i]._id})
          if(datamenuBottom[i].children.length>0){
              for(j=0; j<datamenuBottom[i].children.length; j++){
              datamenuBottom[i].children[j].children = await Menu.find({parent_id:datamenuBottom[i].children[j]._id})
              }
          }
      }
  }

  res.render('frontend/users/checkMail', {
    title: 'Gửi xác nhận email',
    csrfToken: req.csrfToken(),
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
  })
})
app.get('/forget-password/:token_confirm', csrfProtection, async function(req, res){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  //Hiển thị menu chân trang
  var datamenuBottom = await Menu.find({keyname:"menu_bottom",parent_id: null})
  if(datamenuBottom.length>0){
    for(i=0; i<datamenuBottom.length; i++){
      datamenuBottom[i].children = await Menu.find({parent_id:datamenuBottom[i]._id})
      if(datamenuBottom[i].children.length>0){
        for(j=0; j<datamenuBottom[i].children.length; j++){
          datamenuBottom[i].children[j].children = await Menu.find({parent_id:datamenuBottom[i].children[j]._id})
        }
      }
    }
  }
  var messages = await req.flash('error')

  if(req.flash('success').length>0){
    var success = 1
  }else{
    var success = 0
  }
  res.render('frontend/users/forgetPassword', {
    title: 'Thay đổi mật khẩu',
    csrfToken: req.csrfToken(),
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    messages: messages,
    hasErrors: messages.length > 0,
    success: success,
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    token_confirm: req.params.token_confirm,
  })
})

app.post('/forgetPassword', async function(req, res, done){
  req.checkBody('password', 'Mật khẩu không được bỏ trống').notEmpty()
  req.checkBody('password', 'Mật khẩu không nhỏ hơn 6 ký tự').isLength({min:6})
  req.checkBody('repassword','Mật khẩu phải trùng nhau').equals(req.body.password)
  var errors = req.validationErrors()
  if(errors){
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    })
    req.flash('error', messages)
    res.redirect('back')
  }else{
    var itemUser = await Users.findOne({token_confirm: req.body.token_confirm})
    if(itemUser){
      var data = {
        password: bcrypt.hashSync(req.body.password, 8),
        //token_confirm: randomstring.generate()
      }
      var dataUsers = await Users.findByIdAndUpdate(itemUser._id, { $set: data}, { new: true }, function (err, results) {
        return results
      })
      req.flash('success', '1')
      res.redirect('back')
    }else{
      res.redirect('back')
    }
  }

})
app.post('/sendLinkForgetPassword', async function(req, res, next){
  // Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  var itemUser = await Users.findOne({email: req.body.email})
  //res.send(itemUser)
  if(itemUser){
    // Create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        //user: "hokien1992@gmail.com", // generated ethereal user
        //pass: "drloytkqpliwwzwd" // generated ethereal password
        user: "vietnamepay@gmail.com",
        pass: "xynptothaylhwevt"
      },
      tls: {
        rejectUnauthorized: false
      }
    })
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: settings.company, // sender address
      to: req.body.email, // list of receivers
      subject: settings.name, // Subject line
      text: 'Để đổi mật khẩu bạn kích vào link bên dưới để kích hoạt tài khoản nhé', // plain text body
      html: '<a href="https://vietnamepay.com/users/forget-password/'+itemUser.token_confirm+'" target="_blank">Click vào đây để thay đổi mật khẩu</a>' // html body
    })
    res.redirect('back')
  }else{
    res.redirect('back')
  }

})

/* GET users listing. */
app.get('/signup', csrfProtection, async function(req, res, next) {
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  //Hiển thị menu chân trang
  var datamenuBottom = await Menu.find({keyname:"menu_bottom",parent_id: null})
  if(datamenuBottom.length>0){
      for(i=0; i<datamenuBottom.length; i++){
          datamenuBottom[i].children = await Menu.find({parent_id:datamenuBottom[i]._id})
          if(datamenuBottom[i].children.length>0){
              for(j=0; j<datamenuBottom[i].children.length; j++){
              datamenuBottom[i].children[j].children = await Menu.find({parent_id:datamenuBottom[i].children[j]._id})
              }
          }
      }
  }
  var messages = req.flash('error')
  var affRes = req.cookies.affRes
  if (affRes === undefined){
    const query = url.parse(req.url,true).query
    if(query.affRes){
      if(query.affRes!=''){
        res.cookie('affRes',query.affRes, { maxAge: 9000000, httpOnly: true })
      }
    }
  }
  var dataCountry = await Location.aggregate([
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
  var dataProvince = await Location.aggregate([
    { $match : { PROVINCE_CODE : { $exists: true } } },
    { $project: {
          "_id": "$_id",
          "name": "$PROVINCE_NAME",
          "code": "$PROVINCE_CODE",
          "id": "$PROVINCE_ID",
      }
    },
    { $sort: { DISTRICT_ID: -1 } }
  ])
  const query = url.parse(req.url,true).query
  var introduce = ''
  if(query.id){
    introduce = query.id
  }
  var image_seo = req.protocol + 's://' + req.get('host')+'/user/vietnamepay.png'
  var description_seo = settings.slogan
  var title = 'Đăng ký thành viên'
  if(query.banner){
    var itemBannerAffiliate = await Banner_affiliate.findOne({_id: query.banner})
    //res.send(itemBannerAffiliate)
    image_seo = req.protocol + 's://' + req.get('host')+itemBannerAffiliate.imagePath
    description_seo = itemBannerAffiliate.description
    var title= itemBannerAffiliate.name
  }
  //res.send({introduce: introduce})
  res.render('frontend/users/signup', { title: 'Đăng ký', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 ,
    title: title,
    classBody: 'catalog-view_op1',
    description_seo: description_seo,
    image_seo: image_seo,
    urlRoot: req.protocol + 's://' + req.get('host'),
    urlCurrent: req.protocol + 's://' + req.get('host') + req.originalUrl,
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataCountry: dataCountry,
    dataProvince: dataProvince,
    introduce: introduce,
  })
})
app.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/users/signup',
  failureRedirect: '/users/signup',
  failureFlash: true
}))
app.get('/signin',  csrfProtection, async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  //Hiển thị menu chân trang
  var datamenuBottom = await Menu.find({keyname:"menu_bottom",parent_id: null})
  if(datamenuBottom.length>0){
      for(i=0; i<datamenuBottom.length; i++){
          datamenuBottom[i].children = await Menu.find({parent_id:datamenuBottom[i]._id})
          if(datamenuBottom[i].children.length>0){
              for(j=0; j<datamenuBottom[i].children.length; j++){
              datamenuBottom[i].children[j].children = await Menu.find({parent_id:datamenuBottom[i].children[j]._id})
              }
          }
      }
  }
  var messages = await req.flash('error')
  var message_register = {status: 0}
  if(req.flash('message_register')){
    message_register = req.flash('message_register')
  }
  res.render('frontend/users/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0,
    title: 'Đăng nhập',
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    message_register: message_register
  })
})
app.post('/signin', passport.authenticate('local.signin', {
  successRedirect: '/users/dashboard',
  failureRedirect: '/users/signin',
  failureFlash: true
}))

app.get('/auth/facebook', passport.authenticate('facebook',{scope:['email']}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
});

module.exports = app

function isLoggedIn(req, res, next){
  console.log(req.isAuthenticated('local.signin'));
  console.log(req.isAuthenticated('local.adminLogin'));
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/')
}
function notLoggedIn(req, res, next){
  if(!req.isAuthenticated()){
    return next()
  }
  res.redirect('/')
}
