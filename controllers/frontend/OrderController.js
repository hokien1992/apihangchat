var express = require('express')
var bcrypt = require('bcryptjs')
var axios = require('axios');
// thêm sản phẩm giỏ hàng
const Cart = require('../../models/cart')
const Product = require('../../models/product')
const Optionproduct = require('../../models/option_product')
const Users = require('../../models/user')
const Wallet = require('../../models/wallet_v1')
const Wallet2 = require('../../models/wallet_v2')
const Wallet3 = require('../../models/wallet_v3')
const Address = require('../../models/address')
const Exchange = require('../../models/exchange')
const Supplier = require('../../models/supplier')
    //Chèn models
const Order = require('../../models/order')
const Lading = require('../../models/lading')
const Setting = require('../../models/setting')
const Menu = require('../../models/menu')
var dateTime = require('node-datetime')
var dt = dateTime.create()
var moment = require('moment')
var orderController = {}
var router = express.Router()
const url = require('url')
orderController.addCart = async function(req, res, next) {

  const query = url.parse(req.url, true).query
  var productId = query.productId
  var qtys = query.qty
  var cart = new Cart(req.session.cart ? req.session.cart : { items: {} })
  var tracking = query.tracking
  var discount = 0
  var discountPrice = 0
  var arr_id_option_product = []
  var strIdProduct = productId
  //var dataOption= []
  var arrIdOptionProduct = []
  var dataOptionProduct = []
  if(query.arr_id_option_product!=''){
    arr_id_option_product = query.arr_id_option_product.replace(",","_")
    strIdProduct = productId+"_"+query.arr_id_option_product.replace(",","_")
    //dataOption = await Optionproduct.find({_id: {$in: arr_id_option_product}})

    arrIdOptionProduct = query.arr_id_option_product.split(',')
    dataOptionProduct = await Optionproduct.find({ _id: { $in: arrIdOptionProduct } }).populate('parent_id')
  }
  var priceOption = 0;
  if(dataOptionProduct.length>0){
    for(i=0;i<dataOptionProduct.length;i++){
      if(dataOptionProduct[i].price_prefix=="+"){
        priceOption += dataOptionProduct[i].price
      }else{
        priceOption -= dataOptionProduct[i].price
      }
    }
  }
  var dataProduct = await Product.findOne({_id: productId})
  var priceOrder = 0
  if(dataProduct.price_sale!=0){
    priceOrder = parseInt(dataProduct.price_sale) + parseInt(priceOption)
  }else{
    priceOrder = parseInt(dataProduct.price) + parseInt(priceOption)
  }
  if(dataProduct){
    if(req.user){
      const itemAddress = await Address.findOne({user_id: req.user._id, active: 1})
      if(itemAddress){
        cart.addCart(dataProduct, dataProduct._id, qtys, tracking, strIdProduct, dataOptionProduct, priceOrder)
        req.session.cart = cart
        res.send({cart: cart,address: 1})
      }else{
        if(req.user.country==0||req.user.province==0||req.user.district==0||req.user.wards==0){
          cart.addCart(dataProduct, dataProduct._id, qtys, tracking, strIdProduct, dataOptionProduct, priceOrder)
          req.session.cart = cart
          res.send({cart: cart,address: 0})
        }else{
          cart.addCart(dataProduct, dataProduct._id, qtys, tracking, strIdProduct, dataOptionProduct, priceOrder)
          req.session.cart = cart
          res.send({cart: cart,address: 1})
        }
      }
    }else{
      if(req.session.addressCustomer){
        cart.addCart(dataProduct, dataProduct._id, qtys, tracking, strIdProduct, dataOptionProduct, priceOrder)
        req.session.cart = cart
        res.send({cart: cart,address: 1})
      }else{
        cart.addCart(dataProduct, dataProduct._id, qtys, tracking, strIdProduct, dataOptionProduct, priceOrder)
        req.session.cart = cart
        res.send({cart: cart,address: 0})
      }
    }
  }
}
orderController.addOrder = async function(req, res, next) {
  var dataBody = req.body
  var request = req.body
  var dt = dateTime.create()
  var arrItems = []
  var post = new Order(request)
  var itemOrder = await Order.findOne({}).sort({ sort_id: -1 });
  if(itemOrder){
    post.sort_id = itemOrder.sort_id + 1
    post.code = 'DHEP'+post.sort_id
  }else{
    post.sort_id = 1
    post.code = 'DHEP'+1
  }
  var totalOrder = parseFloat(req.session.cart.totalPrice)+parseFloat(req.body.totalPriceShip)
  post.nameCustomer = post.firstname + ' ' + post.lastname
  post.datetime = dt.format('d-m-Y H:M:S')
  post.create_at = Date.now()
  for (var i in req.session.cart.items) {
    arrItems.push([i, req.session.cart.items[i]])
  }
  post.items = arrItems
  post.totalPrice = req.session.cart.totalPrice
  post.totalQty = req.session.cart.totalQty
  post.totalOrder =  parseFloat(req.session.cart.totalPrice)+parseFloat(req.body.totalPriceShip)
  post.totalEpay = Math.round(1.25*post.totalPrice/4800 * 1000)/1000
  post.totalWidth = Math.round(req.session.cart.width * 1000)/1000
  post.totalHeight = Math.round(req.session.cart.height * 1000)/1000
  post.totalLong = Math.round(req.session.cart.long * 1000)/1000
  post.totalWeight = Math.round(req.session.cart.weight * 1000)/1000
  post.status = 0
  post.textStatus = "Đơn hàng mới"
  post.discount = parseFloat(totalOrder)
  //res.send(req.session.addressCustomer)
  if(req.session.addressCustomer){
    post.countryCustomer = req.session.addressCustomer.country
    post.provinceCustomer = req.session.addressCustomer.province
    post.districtCustomer = req.session.addressCustomer.district
    post.wardCustomer = req.session.addressCustomer.wards
    post.addressCustomer = req.session.addressCustomer.address
  }
  if(req.user){
    var itemUser = await Users.findOne({_id: req.user._id})
    .populate('wallet_id')
    .populate('wallet_id2')
    .populate('wallet_id3')
    post.user_id = req.user._id
    post.user_id_o = req.user._id
    post.live = 1
    var itemAddress = await Address.findOne({
      active: 1,
      user_id: req.user._id
    })
    if(itemAddress){
      post.addressCustomer = itemAddress.address
      post.countryCustomer = itemAddress.country
      post.provinceCustomer = itemAddress.province
      post.districtCustomer = itemAddress.district
      post.wardCustomer = itemAddress.wards
    }else{
      post.addressCustomer = req.user.address
      post.addressCustomer = req.user.address
      post.countryCustomer = req.user.country
      post.provinceCustomer = req.user.province
      post.districtCustomer = req.user.district
      post.wardCustomer = req.user.wards
    }
    if(parseInt(req.body.type_payment)==2||parseInt(req.body.type_payment)==3){
      if(parseInt(req.body.type_payment)==2){
        if(itemUser.wallet_id.w_epay<post.totalEpay){
          res.send({
            message: "<div>Tài khoản ví của bạn không đủ để thanh toán.</div>"+
            "<a href='/users/exchange/naptien' target='_blank' style='color: #145696'>Click vào đây để nạp tiền</a>",
            success: 0
          })
        }else{
          post.save(async function(err, result) {
            console.log(result)
            var itemUser = await Users.findOne({_id: result.user_id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')

            if(itemUser){
              if(parseFloat(itemUser.wallet_id.w_epay)>parseFloat(result.totalEpay)){
                var w_epay = parseFloat(itemUser.wallet_id.w_epay) - parseFloat(result.totalEpay)
                var dataw1 = await Wallet.findByIdAndUpdate(itemUser.wallet_id._id, { $set: { w_epay: Math.round(w_epay * 1000)/1000 } }, { new: true })
                var w_epay2 = parseFloat(itemUser.wallet_id2.w_epay)+parseFloat(result.totalEpay*0.8)
                var dataw2 = await Wallet2.findByIdAndUpdate(itemUser.wallet_id2._id, { $set: { w_epay: Math.round(w_epay2 * 1000)/1000 } }, { new: true })
              }
              var addExchange = await addExchangeUser(itemUser, result.totalEpay, result)
              if(itemUser.introduce!=''){
                var itemUserParent = await Users.findOne({username: itemUser.introduce})
                .populate('wallet_id')
                .populate('wallet_id2')
                .populate('wallet_id3')
                if(itemUserParent){
                  var updateWalletUsers = await updateWalletUser(parseFloat(result.totalEpay), itemUser.arr_parent, result)
                }
              }
              var updateWalletUsers = await upadteWalletVietnamepay(parseFloat(result.totalEpay), result)
            }
            if(result){
              var dataVandon = await addVandon(result)
            }
            res.send({
              message: "Đặt hàng thành công",
              url: '/success-cart?idConfirm='+result._id,
              success: 1
            })
          })
        }
        return "ok"
      }else if(parseInt(req.body.type_payment)==3){
        var w_epay3 = Math.round(post.totalEpay/2 * 1000)/1000
        if(itemUser.wallet_id3.w_epay<w_epay3||itemUser.wallet_id.w_epay<w_epay3){
          res.send({
            message: "<div>Tài khoản ví của bạn không đủ để thanh toán.</div>"+
            "<a href='/users/exchange/naptien' target='_blank' style='color: #145696'>Click vào đây để nạp tiền</a>",
            success: 0
          })
        }else{
          post.save(async function(err, result) {
            var itemUser = await Users.findOne({_id: result.user_id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
            if(itemUser){
              // Ví tiêu dùng
              var w_epay = parseFloat(itemUser.wallet_id.w_epay) - parseFloat(result.totalEpay)/2
              var dataw1 = await Wallet.findByIdAndUpdate(itemUser.wallet_id._id, { $set: { w_epay: Math.round(w_epay * 1000)/1000 } }, { new: true })
              // Ví tiết kiệm
              var w_epay2 = parseFloat(itemUser.wallet_id2.w_epay)+parseFloat(result.totalEpay*0.8)
              var dataw2 = await Wallet2.findByIdAndUpdate(itemUser.wallet_id2._id, { $set: { w_epay: Math.round(w_epay2 * 1000)/1000 } }, { new: true })
              // ví epay fan
              var w_epay3 = parseFloat(itemUser.wallet_id3.w_epay) - parseFloat(result.totalEpay)/2
              var dataw3 = await Wallet3.findByIdAndUpdate(itemUser.wallet_id3._id, { $set: { w_epay: Math.round(w_epay3 * 1000)/1000 } }, { new: true })
              var addExchange = await addExchangeUser(itemUser, result.totalEpay, result)
              if(itemUser.introduce!=''){
                var itemUserParent = await Users.findOne({username: itemUser.introduce})
                .populate('wallet_id')
                .populate('wallet_id2')
                .populate('wallet_id3')
                if(itemUserParent){
                  var updateWalletUsers = await updateWalletUser(parseFloat(result.totalEpay), itemUser.arr_parent, result)
                }
              }
              var updateWalletUsers = await upadteWalletVietnamepay(parseFloat(result.totalEpay), result)
            }
            if(result){
              var dataVandon = await addVandon(result)
            }
            res.send({
              message: "Đặt hàng thành công",
              url: '/success-cart?idConfirm='+result._id,
              success: 1
            })
          })
        }
        return "ok"
      }else{
        post.save(async function(err, result) {
          var itemUser = await Users.findOne({_id: result.user_id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
          if(itemUser){
            if(result.type_payment==2){
              if(parseFloat(itemUser.wallet_id.w_epay)>parseFloat(result.totalEpay)){
                var w_epay = parseFloat(itemUser.wallet_id.w_epay) - parseFloat(result.totalEpay)
                var dataw1 = await Wallet.findByIdAndUpdate(itemUser.wallet_id._id, { $set: { w_epay: Math.round(w_epay * 1000)/1000 } }, { new: true })
                var w_epay2 = parseFloat(itemUser.wallet_id2.w_epay)+parseFloat(result.totalEpay*0.8)
                var dataw2 = await Wallet2.findByIdAndUpdate(itemUser.wallet_id2._id, { $set: { w_epay: Math.round(w_epay2 * 1000)/1000 } }, { new: true })
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
                newPost.w_epay = Math.round(result.totalEpay*p * 1000)/1000
                newPost.w_epay2 = Math.round(result.totalEpay*p * 1000)/1000
                newPost.w_epay3 = 0
                newPost.w_epay_prefix = "+"
                newPost.w_epay2_prefix = "-"
                newPost.w_epay3_prefix = "+"

                newPost.user_id = itemUser._id
                newPost.order_id = result._id
                newPost.code = 'HH'+newPost.sort_id
                newPost.number_monney = 100
                newPost.number_epay = 100
                newPost.type_exchange = 2
                newPost.hinhthucthanhtoan = 2
                newPost.sotaikhoan = ''
                newPost.content = 'Được chuyển '+80+'%'+' của '+result.totalEpay+' từ đơn hàng'+'<br><strong>Mã đơn hàng:</strong> '+result.code
                newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
                newPost.math = '+'
                newPost.type_wallet = 2
                newPost.percent = p
                newPost.save(function(err, result){
                  return result
                })
                return "ok"
              }
              return "ok"
            }else if(result.type_payment==3){
              // Ví tiêu dùng
              var w_epay = parseFloat(itemUser.wallet_id.w_epay)-parseFloat(result.totalEpay)/2
              var dataw1 = await Wallet.findByIdAndUpdate(itemUser.wallet_id._id, { $set: { w_epay: Math.round(w_epay * 1000)/1000 } }, { new: true })
              // Ví tiết kiệm
              var w_epay2 = parseFloat(itemUser.wallet_id2.w_epay)+parseFloat(result.totalEpay*0.8)
              var dataw2 = await Wallet2.findByIdAndUpdate(itemUser.wallet_id2._id, { $set: { w_epay: Math.round(w_epay2 * 1000)/1000 } }, { new: true })
              // ví epay fan
              var w_epay3 = parseFloat(itemUser.wallet_id3.w_epay)-parseFloat(result.totalEpay)/2
              var dataw3 = await Wallet3.findByIdAndUpdate(itemUser.wallet_id3._id, { $set: { w_epay: Math.round(w_epay3 * 1000)/1000 } }, { new: true })

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
              newPost.w_epay = Math.round(result.totalEpay*p/2 * 1000)/1000
              newPost.w_epay2 = Math.round(result.totalEpay*p/2 * 1000)/1000
              newPost.w_epay3 = 0
              newPost.w_epay_prefix = "+"
              newPost.w_epay2_prefix = "-"
              newPost.w_epay3_prefix = "+"

              newPost.user_id = itemUser._id
              newPost.order_id = result._id
              newPost.code = 'HH'+newPost.sort_id
              newPost.number_monney = 100
              newPost.number_epay = 100
              newPost.type_exchange = 2
              newPost.hinhthucthanhtoan = 2
              newPost.sotaikhoan = ''
              newPost.content = 'Được chuyển '+80+'%'+' của '+result.totalEpay+' từ đơn hàng'+'<br><strong>Mã đơn hàng:</strong> '+result.code
              newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
              newPost.math = '+'
              newPost.type_wallet = 2
              newPost.percent = p
              newPost.save(function(err, result){
                return result
              })
              return "ok"
            }
            if(itemUser.introduce!=''){
              var itemUserParent = await Users.findOne({username: itemUser.introduce})
              .populate('wallet_id')
              .populate('wallet_id2')
              .populate('wallet_id3')
              if(itemUserParent){
                var updateWalletUsers = await updateWalletUser(parseFloat(result.totalEpay), itemUser.arr_parent, result)
              }
            }
            var updateWalletUsers = await upadteWalletVietnamepay(parseFloat(result.totalEpay), result)
          }
          if(result){
            var dataVandon = await addVandon(result)
          }
          res.send({
            message: "Đặt hàng thành công",
            url: '/success-cart?idConfirm='+result._id,
            success: 1
          })
        })
      }
    }else{
      post.save(async function(err, result) {
        if(result){
          var dataVandon = await addVandon(result)
        }
        res.send({
          message: "Đặt hàng thành công",
          url: '/success-cart?idConfirm='+result._id,
          success: 1
        })
      })
    }
  }else{
    if(parseInt(req.body.type_payment)==2||parseInt(req.body.type_payment)==3){
      res.send({
        message: "Bạn cần phải đăng nhập để thanh toán qua ví",
        success: 0
      })
    }else{
      post.save(async function(err, result) {
        console.log(result.items)
        if(result){
          var dataVandon = await addVandon(result)
        }
        res.send({
          message: "Đặt hàng thành công",
          url: '/success-cart?idConfirm='+result._id,
          success: 1
        })
      })
    }
  }
}
orderController.removeItemCart = async function(req, res, next){
  const query = url.parse(req.url, true).query
  if(query.strIdProduct){
    var arr_id = query.strIdProduct.split('_')
    let dataProduct = await Product.findOne({_id: arr_id[0]})
    let tracking = ''
    if(req.session.cart){
      var cart = new Cart(req.session.cart)
      var strIdProduct = query.strIdProduct
      var arr = []
      for (var _id in cart.items) {
          arr.push(cart.items[_id])
      }
      if(arr.length>1){
        cart.removeItemCart(strIdProduct)
        req.session.cart = cart
      }else{
        delete req.session.cart
      }
      res.redirect('back')
    }
  }
}
function deleteElement(arr, element) {
  var position = arr.indexOf(element);
  if(position === -1) {
          return null;
  }
  return arr.splice(position,1);
}
async function updateWalletUser(totalEpay, arr_parent, order){
  var dataUser = await Users.find({
    _id: {
      $in: arr_parent
    }
  }).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')

  for(i=0;i<dataUser.length;i++){
    if(dataUser.username!="vietnamepay"){
      var number = parseInt(dataUser.length)-1
      var p = 0
      if(i==parseInt(number)){
        if(dataUser[i].wallet_id2.w_epay>=1000&&dataUser[i].wallet_id2.w_epay<=60000){
          p = 0.07
        }else if(dataUser[i].wallet_id2.w_epay>60000&&dataUser[i].wallet_id2.w_epay<=100000){
          p = 0.08
        }else if(dataUser[i].wallet_id2.w_epay>100000&&dataUser[i].wallet_id2.w_epay<=1000000){
          p = 0.09
        }else if(dataUser[i].wallet_id2.w_epay>1000000){
          p = 0.1
        }
      }else{
        if(dataUser[i].wallet_id2.w_epay>=1000&&dataUser[i].wallet_id2.w_epay<=60000){
          p = 0.02
        }else if(dataUser[i].wallet_id2.w_epay>60000&&dataUser[i].wallet_id2.w_epay<=100000){
          p = 0.025
        }else if(dataUser[i].wallet_id2.w_epay>100000&&dataUser[i].wallet_id2.w_epay<=1000000){
          p = 0.03
        }else if(dataUser[i].wallet_id2.w_epay>1000000){
          p = 0.035
        }
      }
      if(order.type_payment==2){
        // Ví tiêu dùng
        var w_epay = parseFloat(dataUser[i].wallet_id.w_epay)+parseFloat(totalEpay*p)
        var dataw1 = await Wallet.findByIdAndUpdate(dataUser[i].wallet_id._id, { $set: { w_epay: Math.round(w_epay * 1000)/1000 } }, { new: true })
        // Ví tiết kiệm
        var w_epay2 = parseFloat(dataUser[i].wallet_id2.w_epay)-parseFloat(totalEpay*p)
        var dataw2 = await Wallet2.findByIdAndUpdate(dataUser[i].wallet_id2._id, { $set: { w_epay: Math.round(w_epay2 * 1000)/1000 } }, { new: true })
        // Thêm lịch sử giao dịch cho đơn hàng
        var newPost = new Exchange()
        var dataExchange = await Exchange.find({}).countDocuments()
        if(dataExchange>0){
          var itemExchange = await Exchange.findOne({}).sort( { sort_id: -1 } )
          newPost.sort_id = parseInt(itemExchange.sort_id)+1
        }else{
          newPost.sort_id = 1
        }
        newPost.wallet_id = dataUser[i].wallet_id._id
        newPost.wallet_id2 = dataUser[i].wallet_id2._id
        newPost.wallet_id3 = dataUser[i].wallet_id3._id
        newPost.w_epay = Math.round(totalEpay*p * 1000)/1000
        newPost.w_epay2 = Math.round(totalEpay*p * 1000)/1000
        newPost.w_epay3 = 0
        newPost.w_epay_prefix = "+"
        newPost.w_epay2_prefix = "-"
        newPost.w_epay3_prefix = "+"
        newPost.user_id = dataUser[i]._id
        newPost.order_id = order._id
        newPost.code = 'HH'+newPost.sort_id
        newPost.type_exchange = 2
        newPost.hinhthucthanhtoan = 2
        newPost.status = 1
        newPost.sotaikhoan = ''
        newPost.content = 'Được chuyển '+p*100+' %'+' của '+totalEpay+' từ đơn hàng'+'<br><strong>Mã đơn hàng:</strong> '+order.code
        newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
        newPost.math = '+'
        newPost.type_wallet = 2
        newPost.percent = p
        newPost.save(function(err, result){
          return result
        })
      }else if(order.type_payment==3){
        // Ví tiêu dùng
        var w_epay = parseFloat(dataUser[i].wallet_id.w_epay)+parseFloat(totalEpay*p/2)
        var dataw1 = await Wallet.findByIdAndUpdate(dataUser[i].wallet_id._id, { $set: { w_epay: Math.round(w_epay * 1000)/1000 } }, { new: true })
        // Ví tiết kiệm
        var w_epay2 = parseFloat(dataUser[i].wallet_id2.w_epay)-parseFloat(totalEpay*p/2)
        var dataw2 = await Wallet2.findByIdAndUpdate(dataUser[i].wallet_id2._id, { $set: { w_epay: Math.round(w_epay2 * 1000)/1000 } }, { new: true })
        // Thêm lịch sử giao dịch cho đơn hàng
        var newPost = new Exchange()
        var dataExchange = await Exchange.find({}).countDocuments()
        if(dataExchange>0){
          var itemExchange = await Exchange.findOne({}).sort( { sort_id: -1 } )
          newPost.sort_id = parseInt(itemExchange.sort_id)+1
        }else{
          newPost.sort_id = 1
        }
        newPost.wallet_id = dataUser[i].wallet_id._id
        newPost.wallet_id2 = dataUser[i].wallet_id2._id
        newPost.wallet_id3 = dataUser[i].wallet_id3._id
        newPost.w_epay = Math.round(totalEpay*p/2 * 1000)/1000
        newPost.w_epay2 = Math.round(totalEpay*p/2 * 1000)/1000
        newPost.w_epay3 = 0
        newPost.w_epay_prefix = "+"
        newPost.w_epay2_prefix = "-"
        newPost.w_epay3_prefix = "+"

        newPost.user_id = dataUser[i]._id
        newPost.order_id = order._id
        newPost.code = 'HH'+newPost.sort_id
        newPost.number_monney = 100
        newPost.number_epay = 100
        newPost.type_exchange = 2
        newPost.hinhthucthanhtoan = 2
        newPost.status = 1
        newPost.sotaikhoan = ''
        newPost.content = 'Được chuyển '+p*100+'%'+' của '+totalEpay+' từ đơn hàng'+'<br><strong>Mã đơn hàng:</strong> '+order.code
        newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
        newPost.math = '+'
        newPost.type_wallet = 2
        newPost.percent = p
        newPost.save(function(err, result){
          return result
        })
      }
    }
  }
  return {message: "ok"}
}

function checkLevelUser(level, wepay2){
  var p = 0
  if(level==1){
    if(wepay2>=1000&&wepay2<=60000){
      p = 0.07
    }else if(wepay2>60000&&wepay2<=100000){
      p = 0.08
    }else if(wepay2>100000&&wepay2<=1000000){
      p = 0.09
    }else if(wepay2>1000000){
      p = 0.1
    }
  }else{
    if(wepay2>=1000&&wepay2<=60000){
      p = 0.02
    }else if(wepay2>60000&&wepay2<=100000){
      p = 0.025
    }else if(wepay2>100000&&wepay2<=1000000){
      p = 0.03
    }else if(wepay2>1000000){
      p = 0.035
    }
  }
  return p
}
async function upadteWalletVietnamepay(totalEpay,result){
  let itemUserParent = await Users.findOne({username: "vietnamepay"}).populate("wallet_id").populate("wallet_id2").populate("wallet_id3")
  if(result.type_payment==2){
    var w_epay = parseFloat(itemUserParent.wallet_id.w_epay) + parseFloat(result.totalEpay*0.8)
    var dataw11 = await Wallet.findByIdAndUpdate(itemUserParent.wallet_id._id, { $set: { w_epay: Math.round(w_epay * 1000)/1000 } }, { new: true })

    var w_epay2 = parseFloat(itemUserParent.wallet_id2.w_epay)+parseFloat(result.totalEpay*0.2)
    var dataw22 = await Wallet2.findByIdAndUpdate(itemUserParent.wallet_id2._id, { $set: { w_epay: Math.round(w_epay2 * 1000)/1000 } }, { new: true })

    // Thêm lịch sử giao dịch cho đơn hàng
    var newPost = new Exchange()
    var dataExchange = await Exchange.find({}).countDocuments()
    if(dataExchange>0){
      var itemExchange = await Exchange.findOne({}).sort( { sort_id: -1 } )
      newPost.sort_id = parseInt(itemExchange.sort_id)+1
    }else{
      newPost.sort_id = 1
    }
    newPost.wallet_id = itemUserParent.wallet_id._id
    newPost.wallet_id2 = itemUserParent.wallet_id2._id
    newPost.wallet_id3 = itemUserParent.wallet_id3._id
    newPost.w_epay = Math.round(totalEpay*0.8 * 1000)/1000
    newPost.w_epay2 = Math.round(totalEpay*0.2 * 1000)/1000
    newPost.w_epay3 = 0
    newPost.w_epay_prefix = "+"
    newPost.w_epay2_prefix = "+"
    newPost.w_epay3_prefix = "+"
    newPost.user_id = itemUserParent._id
    newPost.order_id = result._id
    newPost.code = 'HH'+newPost.sort_id
    newPost.type_exchange = 2
    newPost.hinhthucthanhtoan = 2
    newPost.sotaikhoan = ''
    newPost.content = 'Được chuyển '+80+'%'+' của '+totalEpay+' từ đơn hàng'+'<br><strong>Mã đơn hàng:</strong> '+result.code
    newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
    newPost.math = '+'
    newPost.type_wallet = 2
    newPost.percent = 80
    newPost.save(function(err, result){
      return result
    })
  }else if(result.type_payment==3){

    var w_epay = parseFloat(itemUserParent.wallet_id.w_epay) + parseFloat(result.totalEpay/2*0.8)
    var dataw11 = await Wallet.findByIdAndUpdate(itemUserParent.wallet_id._id, { $set: { w_epay: Math.round(w_epay * 1000)/1000 } }, { new: true })

    var w_epay2 = parseFloat(itemUserParent.wallet_id2.w_epay)+parseFloat(result.totalEpay/2*0.2)
    var dataw22 = await Wallet2.findByIdAndUpdate(itemUserParent.wallet_id2._id, { $set: { w_epay: Math.round(w_epay2 * 1000)/1000 } }, { new: true })

    var w_epay3 = parseFloat(itemUserParent.wallet_id3.w_epay) + parseFloat(result.totalEpay/2*0.8)
    var dataw33 = await Wallet3.findByIdAndUpdate(itemUserParent.wallet_id3._id, { $set: { w_epay: Math.round(w_epay3 * 1000)/1000 } }, { new: true })
    // Thêm lịch sử giao dịch cho đơn hàng
    var newPost = new Exchange()
    var dataExchange = await Exchange.find({}).countDocuments()
    if(dataExchange>0){
      var itemExchange = await Exchange.findOne({}).sort( { sort_id: -1 } )
      newPost.sort_id = parseInt(itemExchange.sort_id)+1
    }else{
      newPost.sort_id = 1
    }
    newPost.wallet_id = itemUserParent.wallet_id._id
    newPost.wallet_id2 = itemUserParent.wallet_id2._id
    newPost.wallet_id3 = itemUserParent.wallet_id3._id
    newPost.w_epay = Math.round(totalEpay/2*0.8 * 1000)/1000
    newPost.w_epay2 = Math.round(totalEpay/2*0.2 * 1000)/1000
    newPost.w_epay3 = Math.round(totalEpay/2*0.8 * 1000)/1000
    newPost.w_epay_prefix = "+"
    newPost.w_epay2_prefix = "+"
    newPost.w_epay3_prefix = "+"
    newPost.user_id = itemUserParent._id
    newPost.order_id = result._id
    newPost.code = 'HH'+newPost.sort_id
    newPost.type_exchange = 2
    newPost.hinhthucthanhtoan = 2
    newPost.sotaikhoan = ''
    newPost.status = 1
    newPost.content = 'Được chuyển '+80+'%'+' của '+totalEpay+'\/2 từ đơn hàng'+'<br><strong>Mã đơn hàng:</strong> '+result.code
    newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
    newPost.math = '+'
    newPost.type_wallet = 2
    newPost.percent = 80
    newPost.save(function(err, result){
      return result
    })
  }

}
async function addExchangeUser(itemUser, totalEpay, result){
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
  if(result.type_payment==2){
    newPost.w_epay = Math.round(result.totalEpay * 1000)/1000
    newPost.w_epay2 = Math.round(result.totalEpay*0.8 * 1000)/1000
    newPost.w_epay3 = 0
    newPost.w_epay_prefix = "-"
    newPost.w_epay2_prefix = "+"
    newPost.w_epay3_prefix = "+"
    newPost.content = 'Mua hết '+Math.round(result.totalEpay * 1000)/1000+' và bạn được cộng  '+Math.round(result.totalEpay*0.8 * 1000)/1000+ ' vào ví tiết kiệm<br><strong>Mã đơn hàng:</strong> '+result.code
  }else if(result.type_payment==3){
    newPost.w_epay = Math.round(result.totalEpay/2 * 1000)/1000
    newPost.w_epay2 = Math.round(result.totalEpay*0.8/2 * 1000)/1000
    newPost.w_epay3 = Math.round(result.totalEpay/2 * 1000)/1000
    newPost.w_epay_prefix = "-"
    newPost.w_epay2_prefix = "+"
    newPost.w_epay3_prefix = "-"
    newPost.content = 'Mua hết '+Math.round(result.totalEpay * 1000)/1000+' và bạn được cộng'+Math.round(result.totalEpay*0.8/2 * 1000)/1000+ ' vào ví tiết kiệm<br><strong>Mã đơn hàng:</strong> '+result.code
  }
  newPost.user_id = itemUser._id
  newPost.order_id = result._id
  newPost.code = 'HH'+newPost.sort_id
  newPost.number_monney = 100
  newPost.number_epay = 100
  newPost.type_exchange = 2
  newPost.hinhthucthanhtoan = 2
  newPost.sotaikhoan = ''

  newPost.datatime_exchange = dt.format('d-m-Y H:M:S')
  newPost.math = '+'
  newPost.type_wallet = 2
  newPost.percent = 80
  newPost.save(function(err, result){
    return result
  })
}
async function addVandon(itemOrder){
  var itemSupplier = await Supplier.findOne({active: 1})
  var datalogin = {
  "USERNAME": "ceo@weon.vn",
  "PASSWORD": "Anhdoan123"
  }
  var config = {
    method: 'post',
    url: 'https://partner.viettelpost.vn/v2/user/Login',
    data: datalogin,
    headers: {
      'Content-Type': 'application/json',
     }
  }
  let instanceLogin = await axios(config)
  var listItem = itemOrder.items.map(function(item){
    return {
      "PRODUCT_NAME" : item[1].item.name,
      "PRODUCT_PRICE" : item[1].item.price,
      "PRODUCT_WEIGHT" : item[1].item.weight,
      "PRODUCT_QUANTITY" : item[1].qty
    }
  })
  //console.log(listItem)
  var datav = {
        "ORDER_NUMBER" : itemOrder.code,
        "GROUPADDRESS_ID" : 5818802,
        "CUS_ID" : 722,
        "DELIVERY_DATE" : "11/10/2018 15:09:52",
        "SENDER_FULLNAME" : itemOrder.nameCustomer,
        "SENDER_ADDRESS" : itemOrder.addressCustomer,
        "SENDER_PHONE" : itemOrder.phoneCustomer,
        "SENDER_EMAIL" : itemOrder.emailCustomer,
        "SENDER_WARD" : itemSupplier.wards,
        "SENDER_DISTRICT" : itemSupplier.district,
        "SENDER_PROVINCE" : itemSupplier.province,
        "SENDER_LATITUDE" : 0,
        "SENDER_LONGITUDE" : 0,
        "RECEIVER_FULLNAME" : itemOrder.nameReceive,
        "RECEIVER_ADDRESS" : itemOrder.addressCustomer,
        "RECEIVER_PHONE" : itemOrder.phoneCustomer,
        "RECEIVER_EMAIL" : itemOrder.emailCustomer,
        "RECEIVER_WARD" : itemOrder.wardCustomer,
        "RECEIVER_DISTRICT" : itemOrder.districtCustomer,
        "RECEIVER_PROVINCE" : itemOrder.provinceCustomer,
        "RECEIVER_LATITUDE" : 0,
        "RECEIVER_LONGITUDE" : 0,
        "PRODUCT_NAME" : "Máy xay sinh tố Philips HR2118 2.0L ",
        "PRODUCT_DESCRIPTION" : "Máy xay sinh tố Philips HR2118 2.0L ",
        "PRODUCT_QUANTITY" : itemOrder.totalQty,
        "PRODUCT_PRICE" : itemOrder.totalPrice,
        "PRODUCT_WEIGHT" : itemOrder.totalWeight,
        "PRODUCT_LENGTH" : itemOrder.totalLong,
        "PRODUCT_WIDTH" : itemOrder.totalWidth,
        "PRODUCT_HEIGHT" : itemOrder.totalheight,
        "PRODUCT_TYPE" : "HH",
        "ORDER_PAYMENT" : 3,
        "ORDER_SERVICE" : "VCN",
        "ORDER_SERVICE_ADD" : "",
        "ORDER_VOUCHER" : "",
        "ORDER_NOTE" : "Đơn hàng mới",
        "MONEY_COLLECTION" : itemOrder.totalPrice,
        "MONEY_TOTALFEE" : 0,
        "MONEY_FEECOD" : 0,
        "MONEY_FEEVAS" : 0,
        "MONEY_FEEINSURRANCE" : 0,
        "MONEY_FEE" : 0,
        "MONEY_FEEOTHER" : 0,
        "MONEY_TOTALVAT" : 0,
        "MONEY_TOTAL" : 0,
        "LIST_ITEM" : listItem
      }
      //console.log(datav)
  var config = {
    method: 'post',
    url: 'https://partner.viettelpost.vn/v2/order/createOrder',
    data: datav,
    headers: {
      'Content-Type': 'application/json',
      'Token': instanceLogin.data.data.token
    }
  }
  let instance = await axios(config)
  var dataVandon = instance.data.data
  console.log(itemOrder.totalWeight)
  console.log(dataVandon)
  var postVandon = new Lading(dataVandon)
  //console.log(itemOrder._id)
  postVandon.order_id = itemOrder._id
  postVandon.code_order = itemOrder.code
  postVandon.note = "Đơn hàng mới"
  postVandon.save(function(error, result){
    //console.log(result)
    return result
  })
}
orderController.success = async function(req, res, next) {
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
    const query = url.parse(req.url, true).query
    var itemOrder = await Order.findOne({_id: query.idConfirm})
    res.render('frontend/order/success', {
        title: 'Gửi đơn hàng thành công',
        classBody: 'catalog-view_op1',
        csrfToken: req.csrfToken(),
        urlRoot: req.protocol + 's://' + req.get('host'),
        settings: settings,
        menu: datamenu,
        datamenuBottom: datamenuBottom,
        datamenuBottom1: datamenuBottom1,
        datamenuBottom2: datamenuBottom2,
        datamenupartner: datamenupartner, // Hiển thị menu đối tác chân trang
        itemOrder: itemOrder
    })
}
module.exports = orderController;
