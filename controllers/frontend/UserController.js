const express = require('express')
const app = express()

const url = require('url')
var formidable = require('formidable')
const fs = require('fs')
//========Fix upload image
var multer = require('multer')
//var upload = multer({dest: './public/upload/'})
var cors = require('cors')
app.use(cors())
//---------------------------
var bcrypt = require('bcryptjs')
var User = require("../../models/user")
var Setting = require('../../models/setting')
var Menu = require('../../models/menu')
var Product = require('../../models/product')
var Catproduct = require('../../models/catproduct')
var Styleproduct = require('../../models/styleproduct')
var Users = require('../../models/user')
const Wallet = require('../../models/wallet_v1')
const Wallet2 = require('../../models/wallet_v2')
const Wallet3 = require('../../models/wallet_v3')
const Address = require('../../models/address')
var Order = require('../../models/order')
var Location = require('../../models/location')
var Exchange = require('../../models/exchange')
var Foldermedia = require("../../models/foldermedia")
var Gallery = require("../../models/gallery")
var Banner_affiliate = require("../../models/banner_affiliate")
var dateTime = require('node-datetime')
var dt = dateTime.create()
var moment = require('moment')
const slugify = require('slugify')
slugify.extend({ 'đ': 'd' })
var userController = {}

// Danh sách sản phẩm của tôi
// View rút tiền
userController.listproduct = async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  if(datamenu.length>0){
      for(i=0; i<datamenu.length; i++){
          datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
          if(datamenu[i].children.length>0){
              for(j=0; j<datamenu[i].children.length; j++){
              datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
              }
          }
      }
  }
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
          datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
          if (datamenupartner[i].children.length > 0) {
              for (j = 0; j < datamenupartner[i].children.length; j++) {
                  datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
              }
          }
      }
  }
  // Danh sách sản phẩm affiliate tracking
  const query = url.parse(req.url,true).query
  var currentUrl = ''
  var finData = {}
  if(query.name){
    currentUrl += "name="+query.name+"&"
    if(query.name!=''){
      finData.name = query.name
    }
  }
  if(query.categoryId){
    currentUrl += "categoryId="+query.categoryId+"&"
    if(query.categoryId!=''){
      finData.category_id = query.categoryId
    }
  }
  if(query.code){
    currentUrl += "code="+query.code
    if(query.categoryId!=''){
      finData.code = query.code
    }
  }
  var perPage = query.perPage || 10
  var page = query.page || 1
  var listProduct = await Product.find(finData)
        .skip((perPage * page) - perPage)
        .limit(perPage)
  var count = await Product.count()
  var itemDataUser = await Users.findOne({_id:req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')

  var dataLevel = {
    name: '',
    commission: 0,
  }
  if(itemDataUser){
    if(itemDataUser.level==0){
      dataLevel = {
        name: 'Thành viên',
        commission: 0,
      }
    }else if(itemDataUser.level==1){
      dataLevel = {
        name: 'CTV cấp 0',
        commission: 10,
      }
    }else if(itemDataUser.level==2){
      dataLevel = {
        name: 'CTV cấp 1',
        commission: 15,
      }
    }else if(itemDataUser.level==3){
      dataLevel = {
        name: 'CTV cấp 2',
        commission: 20,
      }
    }else if(itemDataUser.level==4){
      dataLevel = {
        name: 'CTV cấp 3',
        commission: 25,
      }
    }else if(itemDataUser.level==5){
      dataLevel = {
        name: 'CTV cấp 4',
        commission: 30,
      }
    }else if(itemDataUser.level==6){
      dataLevel = {
        name: 'CTV cấp 5',
        commission: 35,
      }
    }else if(itemDataUser.level==8){
      dataLevel = {
        name: 'Quản lý Online',
        commission: 40,
      }
    }
  }
  for(i=0; i<listProduct.length; i++){
    listProduct[i].tracking = req.user.tracking
  }

  res.render('frontend/users/product/index',{ title: 'Sản phẩm của tôi',
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    datamenuBottom1: datamenuBottom1,
    datamenuBottom2: datamenuBottom2,
    datamenupartner: datamenupartner,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
    listProduct: listProduct,
    //Phân trang
    current: page,
    pages: Math.ceil(count / perPage),
    pagination: { page: page, pageCount: Math.ceil(count / perPage)}
  })
}
userController.storeProduct = async function(req, res, next){
  //res.send(req.file)
  //var datas = req.body
  var itemFolderMedia = await Foldermedia.findOne({ name: 'media_user' })
  //------------------
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/user')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' +file.originalname )
    }
  })
  var upload = multer({ storage: storage }).single('photo')
  var postImages = upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(500).json(err)
    }
    var dataImage = {
      "title": '',
      "path": req.file.path.replace('public', ''),
      "size": req.file.size,
      "filename": req.file.filename,
      "destination": req.file.destination,
    }

    return 'dataImage'
    // Kết thúc up load hình ảnh
  })

  res.send(storage)
}
async function postdataparentid(data_category, id) {
    let ids = id
    let category_id = await data_category.parent_id
    let data_categorys = await Catproduct.findById(data_category.parent_id)
    if (data_categorys.parent_id != null) {
        return await postdataparentid(data_categorys, ids) + '/' + data_categorys.alias
    }
    return data_categorys.alias

}
function uploadImage(){

}
// VIew thêm sản phẩm
userController.createproduct = async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  if(datamenu.length>0){
      for(i=0; i<datamenu.length; i++){
          datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
          if(datamenu[i].children.length>0){
              for(j=0; j<datamenu[i].children.length; j++){
              datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
              }
          }
      }
  }
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
          datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
          if (datamenupartner[i].children.length > 0) {
              for (j = 0; j < datamenupartner[i].children.length; j++) {
                  datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
              }
          }
      }
  }
  // Danh sách sản phẩm affiliate tracking
  const query = url.parse(req.url,true).query
  var currentUrl = ''
  var finData = {}
  if(query.name){
    currentUrl += "name="+query.name+"&"
    if(query.name!=''){
      finData.name = query.name
    }
  }
  if(query.categoryId){
    currentUrl += "categoryId="+query.categoryId+"&"
    if(query.categoryId!=''){
      finData.category_id = query.categoryId
    }
  }
  if(query.code){
    currentUrl += "code="+query.code
    if(query.categoryId!=''){
      finData.code = query.code
    }
  }
  var perPage = query.perPage || 10
  var page = query.page || 1
  var listProduct = await Product.find(finData)
        .skip((perPage * page) - perPage)
        .limit(perPage)
  var count = await Product.count()
  var itemDataUser = await Users.findOne({_id:req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  for(i=0; i<listProduct.length; i++){
    listProduct[i].tracking = req.user.tracking
  }
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
  var dataCatproduct = await Catproduct.find()
  var dataStyleproduct = await Styleproduct.find()
  res.render('frontend/users/product/create',{
    title: 'Thêm sản phẩm',
    csrfToken: req.csrfToken(),
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    datamenuBottom1: datamenuBottom1,
    datamenuBottom2: datamenuBottom2,
    datamenupartner: datamenupartner,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
    listProduct: listProduct,
    dataCatproduct: dataCatproduct,
    dataStyleproduct: dataStyleproduct,
    //Phân trang
    current: page,
    pages: Math.ceil(count / perPage),
    pagination: { page: page, pageCount: Math.ceil(count / perPage)}
  })
}
userController.exchangeMove = async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu hình thức thanh toán
  var datamenutypepayment = await Menu.find({ keyname: "type_payment", parent_id: null }).sort({ _id: 1 })
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  if(datamenu.length>0){
      for(i=0; i<datamenu.length; i++){
          datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
          if(datamenu[i].children.length>0){
              for(j=0; j<datamenu[i].children.length; j++){
                  datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
              }
          }
      }
  }
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
          datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
          if (datamenupartner[i].children.length > 0) {
              for (j = 0; j < datamenupartner[i].children.length; j++) {
                  datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
              }
          }
      }
  }
  var itemDataUser = await Users.findOne({_id:req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  res.render('frontend/users/exchange/exchangeMove',{
      title: 'Chuyển điểm',
      classBody: 'catalog-view_op1',
      urlRoot: req.protocol + 's://' + req.get('host'),
      csrfToken: req.csrfToken(),
      settings: settings,
      datamenutypepayment: datamenutypepayment,
      menu: datamenu,
      datamenuBottom: datamenuBottom,
      dataUser: itemDataUser,
      errors: req.flash('error'),
      success: req.flash('success'),
  })
}
userController.exchangeAddNaptien = async function(req, res, next){
  var form = new formidable.IncomingForm()
      form.uploadDir = './public/exchange'
      form.keepExtensions = true
      form.multiples = true
      form.maxFieldsSize = 1 * 1024 * 1024;
      form.parse(req, async function(err, fields, files) {
        var data = fields
        var arr_image = []
        if(files.files.length>0||files.files.size>0){
          if(files.files.length){
            for(i=0;i<files.files.length;i++){
              arr_image.push(files.files[i].path.substr(6, 1000000000000))
            }
          }else{
            arr_image[0]=files.files.path.substr(6, 1000000000000)
          }
          data.arr_image = arr_image
          if(data.captcha==req.session.captcha){
            var newPost = new Exchange(data)
            var dataExchange = await Exchange.find({}).countDocuments()
            if(dataExchange>0){
              var itemExchange = await Exchange.findOne({}).sort( { sort_id: -1 } )
              newPost.sort_id = parseInt(itemExchange.sort_id)+1
            }else{
              newPost.sort_id = 1
            }
            newPost.wallet_id = req.user.wallet_id
            newPost.wallet_id2 = req.user.wallet_id2
            newPost.wallet_id3 = req.user.wallet_id3
            newPost.user_id = req.user._id
            newPost.code = 'NT'+newPost.sort_id
            newPost.number_monney = parseInt(data.number_epay)*4800
            newPost.number_epay = parseInt(data.number_epay)
            newPost.type_exchange = data.type_exchange
            newPost.hinhthucthanhtoan = data.hinhthucthanhtoan
            newPost.sotaikhoan = data.sotaikhoan
            newPost.content = data.content
            newPost.create_at = newPost.update_at
            newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
            newPost.math = '+'
            //res.send(newPost)
            newPost.save(function(err, result){
              req.flash('success', 'Gửi yêu cầu thành công chờ kế toán xác nhận!')
              res.redirect('back')
            })
          }else{
            var messages = ['Mã capcha không khớp']
            req.flash('error', messages)
            res.redirect('back')
          }
        }else{
          var messages = ['Bạn cần phải up chứng từ']
          req.flash('error', messages)
          res.redirect('back')
        }
      })
}
userController.exchangePostMove = async function(req, res, next){
  req.checkBody('number_epay', 'Số epay không được bỏ trống!').notEmpty()
  req.checkBody('username', 'Tài khoản người nhận không được bỏ trống!').notEmpty()
  req.checkBody('captcha', 'Mã captcha không khớp').equals(req.session.captcha)

  let itemUser = await Users.findOne({username: req.body.username}).populate("wallet_id").populate("wallet_id2").populate("wallet_id3")

  let itemUserNow = await Users.findOne({_id: req.user._id}).populate("wallet_id").populate("wallet_id2").populate("wallet_id3")

  if(parseFloat(itemUserNow.wallet_id.w_epay) < parseFloat(req.body.number_epay)){
    var messages = []
    let errUser = "Số tiền chuyển vượt quá số tiền trong tài khoản!"
    messages.push(errUser)
    req.flash('error', messages)
    res.redirect('/users/exchange/move')
  }
  let errUser = ""
  if(itemUser){
    if(req.body.username === req.user.username){
      var messages = []
      let errUser = "Không thể chuyển vào tài khoản của bạn!"
      messages.push(errUser)
      req.flash('error', messages)
      res.redirect('/users/exchange/move')
    }
  }else{
    var messages = []
    let errUser = "Không tồn tại tài khoản này!"
    messages.push(errUser)
    req.flash('error', messages)
    res.redirect('/users/exchange/move')
  }
  var errors = req.validationErrors()
  if(errors||messages){
      var messages = []

      errors.forEach(function(error){
          messages.push(error.msg)
      })
      req.flash('error', messages)
      res.redirect('/users/exchange/move')
  }else{
    // Cập nhật ví tài khoản chuyển điểm
    let walletnow = parseFloat(itemUserNow.wallet_id.w_epay) - parseFloat(req.body.number_epay)
    var datawnow = await Wallet.findByIdAndUpdate(itemUserNow.wallet_id._id, { $set: { w_epay: Math.round(walletnow * 1000)/1000 } }, { new: true })
    let dataExchange = await addExchangeUser(itemUserNow, itemUser, parseFloat(req.body.number_epay), 1, "-", req.body.content )
    // Cập nhật ví tài khoản nhận tiền
    let wallet_receiver = parseFloat(itemUser.wallet_id.w_epay) + parseFloat(req.body.number_epay)
    var dataw_receiver = await Wallet.findByIdAndUpdate(itemUser.wallet_id._id, { $set: { w_epay: Math.round(wallet_receiver * 1000)/1000 } }, { new: true })
    let dataExchangeReceiver = await addExchangeUser(itemUser, itemUserNow, parseFloat(req.body.number_epay), 1, "+", req.body.content )
    req.flash('success', "Chuyển tiền thành công!")
    res.redirect('/users/exchange/move')
  }
}
async function addExchangeUser(itemUser, itemUser2, number_epay, type_wallet, dau, content){
  // Thêm lịch sử giao dịch cho đơn hàng
  var newPost = new Exchange()
  var dataExchange = await Exchange.find({}).countDocuments()
  if(dataExchange>0){
    var itemExchange = await Exchange.findOne({}).sort( { sort_id: -1 } )
    newPost.sort_id = parseInt(itemExchange.sort_id)+1
  }else{
    newPost.sort_id = 1
  }
  newPost.wallet_id = itemUser.wallet_id._id
  newPost.wallet_id2 = itemUser.wallet_id2._id
  newPost.wallet_id3 = itemUser.wallet_id3._id
  newPost.w_epay = Math.round(number_epay * 1000)/1000
  newPost.w_epay2 = 0
  newPost.w_epay3 = 0
  newPost.w_epay_prefix = dau
  newPost.w_epay2_prefix = "+"
  newPost.w_epay3_prefix = "+"
  newPost.user_id = itemUser._id
  if(dau == "-"){
    newPost.user_id_receiver = itemUser._id
  }else{
    newPost.user_id_send = itemUser2._id
  }
  newPost.code = 'CT'+newPost.sort_id
  newPost.number_epay = Math.round(number_epay * 1000)/1000
  newPost.type_exchange = 4
  newPost.content = content
  newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
  newPost.math = '+'
  newPost.type_wallet = type_wallet
  newPost.save(function(err, result){
    console.log(result)
    return result
  })
}
userController.exchangeAddRuttiens = async function(req, res, next){
  req.checkBody('number_epay', 'Số epay không được bỏ trống!').notEmpty()
  req.checkBody('captcha', 'Mã captcha không khớp').equals(req.session.captcha)
  // if(req.body.hinhthucthanhtoan==1){
  //   req.checkBody('sotaikhoan', 'Số tài khoản không được bỏ trống!').notEmpty()
  // }
  var errors = req.validationErrors()
  if(errors){
      var messages = []
      errors.forEach(function(error){
          messages.push(error.msg)
      })
      req.flash('error', messages)
      res.redirect('/users/exchange/naptien')
  }else{
    var newPost = new Exchange()
    var dataExchange = await Exchange.find({}).countDocuments()
    if(dataExchange>0){
      var itemExchange = await Exchange.findOne({}).sort( { sort_id: -1 } )
      newPost.sort_id = parseInt(itemExchange.sort_id)+1
    }else{
      newPost.sort_id = 1
    }
    newPost.wallet_id = req.user.wallet_id
    newPost.wallet_id2 = req.user.wallet_id2
    newPost.wallet_id3 = req.user.wallet_id3
    newPost.user_id = req.user._id
    newPost.code = 'NT'+newPost.sort_id
    newPost.number_monney = parseInt(req.body.number_epay)*4800
    newPost.number_epay = parseInt(req.body.number_epay)
    newPost.type_exchange = req.body.type_exchange
    newPost.hinhthucthanhtoan = req.body.hinhthucthanhtoan
    newPost.sotaikhoan = req.body.sotaikhoan
    newPost.content = req.body.content
    newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
    newPost.math = '+'
    newPost.save(function(err, result){
      req.flash('success', 'Gửi yêu cầu thành công chờ kế toán xác nhận!')
      res.redirect('/users/exchange/naptien')
    })
  }
}
// View rút tiền
userController.exchangeRuttien = async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  if(datamenu.length>0){
      for(i=0; i<datamenu.length; i++){
          datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
          if(datamenu[i].children.length>0){
              for(j=0; j<datamenu[i].children.length; j++){
              datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
              }
          }
      }
  }
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
          datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
          if (datamenupartner[i].children.length > 0) {
              for (j = 0; j < datamenupartner[i].children.length; j++) {
                  datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
              }
          }
      }
  }
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
      var finData = {
        $or: [{id_npp: itemDataUser._id},{id_npp_parent: itemDataUser._id}]
      }
    }else if(itemDataUser.level==1){
      dataLevel = {
        name: 'Tổng Đại Lý',
        commission: 50,
      }
      var finData = {
        id_tdl: itemDataUser._id
      }
    }else if(itemDataUser.level==2){
      dataLevel = {
        name: 'Đại Lý',
        commission: 45,
      }
      var finData = {
        id_dl: itemDataUser._id
      }
    }else if(itemDataUser.level==3){
      dataLevel = {
        name: 'Cộng tác viên',
        commission: 20,
      }
      var finData = {
        $or: [{id_ctv: itemDataUser._id},{id_ctv_parent: itemDataUser._id}]
      }
    }else if(itemDataUser.level==4){
      dataLevel = {
        name: 'Thành viên',
        commission: 20,
      }
      var finData = {
        id_tv: itemDataUser._id
      }
    }
  }

  res.render('frontend/users/exchange/view-ruttien',{ title: 'Gửi yêu cầu rút tiền',
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    csrfToken: req.csrfToken(),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
    errors: req.flash('error'),
    success: req.flash('success'),
  })
}
// View rút tiền
userController.exchangeNaptien = async function(req, res, next){
    //Cấu hình hệ thống
    var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
    //Hiển thị menu hình thức thanh toán
    var datamenutypepayment = await Menu.find({ keyname: "type_payment", parent_id: null }).sort({ _id: 1 })
    //Hiển thị menu top
    var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
    if(datamenu.length>0){
        for(i=0; i<datamenu.length; i++){
            datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
            if(datamenu[i].children.length>0){
                for(j=0; j<datamenu[i].children.length; j++){
                    datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
                }
            }
        }
    }
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
            datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
            if (datamenupartner[i].children.length > 0) {
                for (j = 0; j < datamenupartner[i].children.length; j++) {
                    datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
                }
            }
        }
    }
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
            var finData = {
                $or: [{id_npp: itemDataUser._id},{id_npp_parent: itemDataUser._id}]
            }
        }else if(itemDataUser.level==1){
            dataLevel = {
                name: 'Tổng Đại Lý',
                commission: 50,
            }
            var finData = {
                id_tdl: itemDataUser._id
            }
        }else if(itemDataUser.level==2){
            dataLevel = {
                name: 'Đại Lý',
                commission: 45,
            }
            var finData = {
                id_dl: itemDataUser._id
            }
        }else if(itemDataUser.level==3){
            dataLevel = {
                name: 'Cộng tác viên',
                commission: 20,
            }
            var finData = {
                $or: [{id_ctv: itemDataUser._id},{id_ctv_parent: itemDataUser._id}]
            }
        }else if(itemDataUser.level==4){
            dataLevel = {
                name: 'Thành viên',
                commission: 20,
            }
            var finData = {
                id_tv: itemDataUser._id
            }
        }
    }
    res.render('frontend/users/exchange/view-naptien',{
        title: 'Nạp tiền',
        classBody: 'catalog-view_op1',
        urlRoot: req.protocol + 's://' + req.get('host'),
        csrfToken: req.csrfToken(),
        settings: settings,
        datamenutypepayment: datamenutypepayment,
        menu: datamenu,
        datamenuBottom: datamenuBottom,
        dataUser: itemDataUser,
        dataLevel: dataLevel,
        errors: req.flash('error'),
        success: req.flash('success'),
    })
}
userController.exchangeViewAkie = async function(req, res, next){
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
      var finData = {
        $or: [{id_npp: itemDataUser._id},{id_npp_parent: itemDataUser._id}]
      }
    }else if(itemDataUser.level==1){
      dataLevel = {
        name: 'Tổng Đại Lý',
        commission: 50,
      }
      var finData = {
        id_tdl: itemDataUser._id
      }
    }else if(itemDataUser.level==2){
      dataLevel = {
        name: 'Đại Lý',
        commission: 45,
      }
      var finData = {
        id_dl: itemDataUser._id
      }
    }else if(itemDataUser.level==3){
      dataLevel = {
        name: 'Cộng tác viên',
        commission: 20,
      }
      var finData = {
        $or: [{id_ctv: itemDataUser._id},{id_ctv_parent: itemDataUser._id}]
      }
    }else if(itemDataUser.level==4){
      dataLevel = {
        name: 'Thành viên',
        commission: 20,
      }
      var finData = {
        id_tv: itemDataUser._id
      }
    }
  }
  res.render('frontend/users/exchange/view-exchange-akie',{ title: 'Chuyển đổi sang ví Akie',
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    datamenuBottom1: datamenuBottom1,
    datamenuBottom2: datamenuBottom2,
    datamenupartner: datamenupartner,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
  })
}
// Giao dịch
userController.exchange = async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  if(datamenu.length>0){
      for(i=0; i<datamenu.length; i++){
          datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
          if(datamenu[i].children.length>0){
              for(j=0; j<datamenu[i].children.length; j++){
              datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
              }
          }
      }
  }
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
          datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
          if (datamenupartner[i].children.length > 0) {
              for (j = 0; j < datamenupartner[i].children.length; j++) {
                  datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
              }
          }
      }
  }
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
      var finData = {
        $or: [{id_npp: itemDataUser._id},{id_npp_parent: itemDataUser._id}]
      }
    }else if(itemDataUser.level==1){
      dataLevel = {
        name: 'Tổng Đại Lý',
        commission: 50,
      }
      var finData = {
        id_tdl: itemDataUser._id
      }
    }else if(itemDataUser.level==2){
      dataLevel = {
        name: 'Đại Lý',
        commission: 45,
      }
      var finData = {
        id_dl: itemDataUser._id
      }
    }else if(itemDataUser.level==3){
      dataLevel = {
        name: 'Cộng tác viên',
        commission: 20,
      }
      var finData = {
        $or: [{id_ctv: itemDataUser._id},{id_ctv_parent: itemDataUser._id}]
      }
    }else if(itemDataUser.level==4){
      dataLevel = {
        name: 'Thành viên',
        commission: 20,
      }
      var finData = {
        id_tv: itemDataUser._id
      }
    }
  }
  res.render('frontend/users/exchange',{ title: 'Giao dịch thanh toán',
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
  })
}
// lích sử đơn hàng
userController.viewOrder = async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  if(datamenu.length>0){
      for(i=0; i<datamenu.length; i++){
          datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
          if(datamenu[i].children.length>0){
              for(j=0; j<datamenu[i].children.length; j++){
              datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
              }
          }
      }
  }
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
          datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
          if (datamenupartner[i].children.length > 0) {
              for (j = 0; j < datamenupartner[i].children.length; j++) {
                  datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
              }
          }
      }
  }
  // Danh sách sản phẩm affiliate tracking
  const query = url.parse(req.url,true).query
  var currentUrl = ''
  var itemDataUser = await Users.findOne({_id:req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  var itemOrder = await Order.findOne({_id: req.params.id}).populate('user_id_o')
  //res.send({data:itemOrder.items[0][1].priceQty})
  res.render('frontend/users/view-order',{ title: 'Đơn hàng'+itemOrder.code,
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    itemOrder: itemOrder,
  })
}
// lích sử đơn hàng
userController.historyOrder = async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  if(datamenu.length>0){
      for(i=0; i<datamenu.length; i++){
          datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
          if(datamenu[i].children.length>0){
              for(j=0; j<datamenu[i].children.length; j++){
              datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
              }
          }
      }
  }
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
          datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
          if (datamenupartner[i].children.length > 0) {
              for (j = 0; j < datamenupartner[i].children.length; j++) {
                  datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
              }
          }
      }
  }
  // Danh sách sản phẩm affiliate tracking
  const query = url.parse(req.url,true).query
  var itemDataUser = await Users.findOne({_id: req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  var finData = {user_id: req.user._id}
  // if(query.code){
  //   currentUrl += "code="+query.code
  //   if(query.categoryId!=''){
  //     finData.code = query.code
  //   }
  // }
  var perPage = query.perPage || 10
  var page = query.page || 1
  var listOrder = await Order.find(finData).sort({_id: -1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
  var count = await Order.find(finData).countDocuments()
  //res.send(listOrder);

  res.render('frontend/users/history-order',{ title: 'Lịch sử đơn hàng',
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    datamenuBottom1: datamenuBottom1,
    datamenuBottom2: datamenuBottom2,
    datamenupartner: datamenupartner,
    dataUser: itemDataUser,
    listOrder: listOrder,
    //Phân trang
    current: page,
    pages: Math.ceil(count / perPage),
    pagination: { page: page, pageCount: Math.ceil(count / perPage)}
  })
}
userController.affiliateAddBanner = async function(req, res, next){
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
  res.render('frontend/users/affiliate-add-banner',{ title: 'Thêm banner',
    classBody: 'catalog-view_op1',
    csrfToken: req.csrfToken(),
    urlRoot: urlRoot,
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    dataLevel: dataLevel
  })
}
userController.addBannerAffiliate= async function(req, res, next){
  var form = new formidable.IncomingForm()
  form.uploadDir = './public/banneraffiliate'
  form.keepExtensions = true
  form.multiples = false
  form.maxFieldsSize = 1 * 1024 * 1024
  form.parse(req, function(err, fields, files) {
    var data = fields
    if(files.file.size!=0){
      data.imagePath = files.file.path.substr(6, 1000000000000)
    }
    data.user_id = req.user._id
    var datapost = new Banner_affiliate(data)
    datapost.save(function (err, results) {
      res.redirect('/users/banner-affiliate')
    })
  })
}
userController.removeBannerAffiliate= async function(req, res, next){
  Banner_affiliate.remove({_id: req.body.idUser}, function(err) {
    res.redirect('back')
  })
}
userController.affiliateBanner = async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  if(datamenu.length>0){
      for(i=0; i<datamenu.length; i++){
          datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
          if(datamenu[i].children.length>0){
              for(j=0; j<datamenu[i].children.length; j++){
              datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
              }
          }
      }
  }
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
          datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
          if (datamenupartner[i].children.length > 0) {
              for (j = 0; j < datamenupartner[i].children.length; j++) {
                  datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
              }
          }
      }
  }
  // Danh sách sản phẩm affiliate tracking
  const query = url.parse(req.url,true).query
  var currentUrl = ''
  var finData = {}
  if(query.name){
    currentUrl += "name="+query.name+"&"
    if(query.name!=''){
      finData.name = query.name
    }
  }
  var perPage = query.perPage || 10
  var page = query.page || 1
  var listProduct = await  Banner_affiliate.find({$and: [{user_id: req.user._id},finData]})
        .populate('user_id')
        .skip((perPage * page) - perPage)
        .limit(perPage)
  var count = await Banner_affiliate.count()
  var itemDataUser = await Users.findOne({_id:req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  var dataLevel = {
    name: '',
    commission: 0,
  }
  if(itemDataUser){
    if(itemDataUser.level==0){
      dataLevel = {
        name: 'Thành viên',
        commission: 0,
      }
    }else if(itemDataUser.level==1){
      dataLevel = {
        name: 'CTV cấp 0',
        commission: 10,
      }
    }else if(itemDataUser.level==2){
      dataLevel = {
        name: 'CTV cấp 1',
        commission: 15,
      }
    }else if(itemDataUser.level==3){
      dataLevel = {
        name: 'CTV cấp 2',
        commission: 20,
      }
    }else if(itemDataUser.level==4){
      dataLevel = {
        name: 'CTV cấp 3',
        commission: 25,
      }
    }else if(itemDataUser.level==5){
      dataLevel = {
        name: 'CTV cấp 4',
        commission: 30,
      }
    }else if(itemDataUser.level==6){
      dataLevel = {
        name: 'CTV cấp 5',
        commission: 35,
      }
    }else if(itemDataUser.level==8){
      dataLevel = {
        name: 'Quản lý Online',
        commission: 40,
      }
    }
  }
  for(i=0; i<listProduct.length; i++){
    listProduct[i].tracking = req.user.tracking
    if(listProduct[i].price_sale!=0){
      listProduct[i].price_commission = parseFloat((parseFloat(listProduct[i].price_sale)-parseFloat(listProduct[i].price_old))*parseFloat(dataLevel.commission)/100)
    }
  }
  res.render('frontend/users/affiliate-banner',{ title: 'Affilate Banner',
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    datamenuBottom1: datamenuBottom1,
    datamenuBottom2: datamenuBottom2,
    datamenupartner: datamenupartner,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
    listProduct: listProduct,
    //Phân trang
    current: page,
    pages: Math.ceil(count / perPage),
    pagination: { page: page, pageCount: Math.ceil(count / perPage)}
  })
}
userController.affiliateTracking = async function(req, res, next){
  //Cấu hình hệ thống
  var settings = await Setting.findOne({lang: "index"}).populate('logo').populate('favicon')
  //Hiển thị menu top
  var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
  if(datamenu.length>0){
      for(i=0; i<datamenu.length; i++){
          datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
          if(datamenu[i].children.length>0){
              for(j=0; j<datamenu[i].children.length; j++){
              datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
              }
          }
      }
  }
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
          datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
          if (datamenupartner[i].children.length > 0) {
              for (j = 0; j < datamenupartner[i].children.length; j++) {
                  datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
              }
          }
      }
  }
  // Danh sách sản phẩm affiliate tracking
  const query = url.parse(req.url,true).query
  var currentUrl = ''
  var finData = {}
  if(query.name){
    currentUrl += "name="+query.name+"&"
    if(query.name!=''){
      finData.name = query.name
    }
  }
  if(query.categoryId){
    currentUrl += "categoryId="+query.categoryId+"&"
    if(query.categoryId!=''){
      finData.category_id = query.categoryId
    }
  }
  if(query.code){
    currentUrl += "code="+query.code
    if(query.categoryId!=''){
      finData.code = query.code
    }
  }
  var perPage = query.perPage || 10
  var page = query.page || 1
  var listProduct = await Product.find(finData)
        .skip((perPage * page) - perPage)
        .limit(perPage)
  var count = await Product.count()
  var itemDataUser = await Users.findOne({_id:req.user._id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
  var dataLevel = {
    name: '',
    commission: 0,
  }
  if(itemDataUser){
    if(itemDataUser.level==0){
      dataLevel = {
        name: 'Thành viên',
        commission: 0,
      }
    }else if(itemDataUser.level==1){
      dataLevel = {
        name: 'CTV cấp 0',
        commission: 10,
      }
    }else if(itemDataUser.level==2){
      dataLevel = {
        name: 'CTV cấp 1',
        commission: 15,
      }
    }else if(itemDataUser.level==3){
      dataLevel = {
        name: 'CTV cấp 2',
        commission: 20,
      }
    }else if(itemDataUser.level==4){
      dataLevel = {
        name: 'CTV cấp 3',
        commission: 25,
      }
    }else if(itemDataUser.level==5){
      dataLevel = {
        name: 'CTV cấp 4',
        commission: 30,
      }
    }else if(itemDataUser.level==6){
      dataLevel = {
        name: 'CTV cấp 5',
        commission: 35,
      }
    }else if(itemDataUser.level==8){
      dataLevel = {
        name: 'Quản lý Online',
        commission: 40,
      }
    }
  }
  for(i=0; i<listProduct.length; i++){
    listProduct[i].tracking = req.user.tracking
    if(listProduct[i].price_sale!=0){
      listProduct[i].price_commission = parseFloat((parseFloat(listProduct[i].price_sale)-parseFloat(listProduct[i].price_old))*parseFloat(dataLevel.commission)/100)
    }
  }
  res.render('frontend/users/affiliate-tracking',{ title: 'Affilate Tracking',
    classBody: 'catalog-view_op1',
    urlRoot: req.protocol + 's://' + req.get('host'),
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    datamenuBottom1: datamenuBottom1,
    datamenuBottom2: datamenuBottom2,
    datamenupartner: datamenupartner,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
    listProduct: listProduct,
    //Phân trang
    current: page,
    pages: Math.ceil(count / perPage),
    pagination: { page: page, pageCount: Math.ceil(count / perPage)}
  })
}
userController.list = function(req, res, next) {
    User.find(function(err, docs){
      res.json(docs);
    })
}
userController.getAll = function(req, res, next) {
    User.find({}, { password: 0 }).then((err, users) => {
        if(err)
            res.send(err)
        else if(!users)
            res.send(404)
        else
            res.send(users)
        next()
    });
};
userController.show = function(req, res) {
    var useId = req.params.id;
    User.find(useId, { password: 0 }).then((err, users) => {
        if(err)
          res.send(err)
        else if(!users)
          res.send(404)
        else
          res.send(users)
        next()
    })
}
userController.editUser = async function(req, res){
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/user')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' +file.originalname )
    }
  })
  var upload = multer({ storage: storage }).single('file')
  var postImages = await upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(500).json(err)
    }
    var dataImage = {
      "title": '',
      "path": req.file.path.replace('public', ''),
      "size": req.file.size,
      "filename": req.file.filename,
      "destination": req.file.destination,
    }
      res.send({dataImage: dataImage})
  })
  res.send({file: req.body})
}
userController.changePassword = function(req, res, next){
    req.checkBody('password', 'Mật khẩu không nhỏ hơn 6 ký tự').notEmpty().isLength({min:6})
    req.checkBody('repassword','Mật khẩu phải trùng nhau').equals(req.body.password)
}
userController.create = function(req, res) {
    //res.send('View tạo tài khoản')
    // var data = req.body
    //
    // User.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
    //
    // })
}
//Add record
userController.store = function(req, res) {
    User.findOne({'email': req.body.email}, function(err, user){
        var newPost = new User()
        if(req.body.password){
            var hashedPassword = bcrypt.hashSync(req.body.password, 8);
            newPost.password = hashedPassword;
        }
        newPost.name = req.body.name;
        newPost.email = req.body.email;
        newPost.save(function(err, newPost){
            res.send(newPost)
        })
    })
}
userController.edit = function(req, res) {
    User.findOne({_id: req.params.id}).exec(function (err, results) {
      if (err) {
        res.redirect("/admin/show/"+res._id)
      }
      else {
        res.render("backend/admin/edit", {results: results, csrfToken: req.csrfToken(), layout: 'layouts/backend/home'});
      }
    })
}
userController.update = function(req, res) {
    var messenger = {};
    var data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        zalo: req.body.zalo,
        website: req.body.website,
        facebook: req.body.facebook,
        gplus: req.body.gplus,
        address: req.body.address,
    }
    User.findOne({'email': req.body.email}, function(err, result){
        if(result && result._id!=req.params.id){
            res.redirect("/admin/edit/"+req.params.id);
        }else{
            User.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.render("backend/admin/edit", {results: req.body, csrfToken: req.csrfToken(), layout: 'layouts/backend/home' })
            })
        }
    })
}

userController.delete = function(req, res) {
  User.remove({_id: req.params.id}, function(err) {
    if(err) {
      res.redirect("/admin/list")
    }
    else {
      res.redirect("/admin/list")
    }
  })
}
// lích sử giao dịch
userController.historyExchange = async function(req, res, next){
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
  //var dataExchange = await Exchange.find({user_id: req.user._id})
  const query = url.parse(req.url,true).query
  var currentUrl = ''
  var finData = {}
  if(query.name){
    currentUrl += "name="+query.name+"&"
    if(query.name!=''){
      finData.name = query.name
    }
  }
  var perPage = query.perPage || 10
  var page = query.page || 1
  var dataExchange = await Exchange.find({$and: [{user_id: req.user._id},finData]})
        .sort({_id: -1})
        .populate('user_id')
        .skip((perPage * page) - perPage)
        .limit(perPage)
  var count = await dataExchange.length
  res.render('frontend/users/exchange/historyExchange',{
    title: 'Lịch sử giao dịch',
    classBody: 'catalog-view_op1',
    csrfToken: req.csrfToken(),
    urlRoot: urlRoot,
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
    dataExchange: dataExchange,
    //Phân trang
    current: page,
    pages: Math.ceil(count / perPage),
    pagination: { page: page, pageCount: Math.ceil(count / perPage)}
  })
}
// lích sử giao dịch
userController.detailExchange = async function(req, res, next){
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
  var itemExchange = await Exchange.findOne({_id: req.params.id}).populate('user_id')
  res.render('frontend/users/exchange/detailExchange',{
    title: 'Chi tiết giao dịch',
    classBody: 'catalog-view_op1',
    csrfToken: req.csrfToken(),
    urlRoot: urlRoot,
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
    itemExchange: itemExchange,
  })
}
userController.listUsers = async function (req, res, next){
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
  //var dataExchange = await Exchange.find({user_id: req.user._id})
  const query = url.parse(req.url,true).query
  var currentUrl = ''
  var finData = {}
  // if(query.name){
  //   currentUrl += "name="+query.name+"&"
  //   if(query.name!=''){
  //     finData.name = query.name
  //   }
  // }
  var perPage = query.perPage || 10
  var page = query.page || 1
  var dataUsers = await Users.find({arr_parent: { $all: [itemDataUser._id] }})
        .skip((perPage * page) - perPage)
        .limit(perPage)
  var count = await dataUsers.length
  res.render('frontend/users/listUsers',{
    title: 'Danh sách thành viên',
    classBody: 'catalog-view_op1',
    csrfToken: req.csrfToken(),
    urlRoot: urlRoot,
    settings: settings,
    menu: datamenu,
    datamenuBottom: datamenuBottom,
    dataUser: itemDataUser,
    dataLevel: dataLevel,
    dataUsers: dataUsers,
    //Phân trang
    current: page,
    pages: Math.ceil(count / perPage),
    pagination: { page: page, pageCount: Math.ceil(count / perPage)}
  })
}
module.exports = userController
