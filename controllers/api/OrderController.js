const express = require('express')
const slugify = require('slugify')
slugify.extend({'đ': 'd'})
const Order = require("../../models/order")
const Users = require("../../models/user")
const Wallet_v1 = require("../../models/wallet_v1")
const dateTime = require('node-datetime')
const url = require('url')
const orderController = {}
orderController.list = function(req, res, next) {
  const filter = {}
  const query = url.parse(req.url,true).query
  var perPage = query.perPage || 10
  var page = query.page || 1
  var dataSeacrh = []
  if(query){
    if(query.code!=''){
        dataSeacrh.push({code: query.code})
    }
    if(query.status!=''){
        dataSeacrh.push({status: parseInt(query.status)})
    }
    if(dataSeacrh.length>0){
        filter.$and = dataSeacrh
    }
    Order.find(filter)
    .skip((perPage * page) - perPage)
    .limit(perPage).sort({_id: -1}).exec((err, posts) => {
      Order.find(filter).countDocuments().exec(function(err, count) {
        res.send({
          posts: posts,
          current: page,
          pages: Math.ceil(count / perPage),
          count:count,
        })
      })
    })
  }else{
    Order.find({}).exec((err, post) => {
      res.send(post)
    })
  }
}
orderController.getAll = function(req, res, next) {
  Order.find({}).exec((err, post) => {
      res.send(post)
  })
}
orderController.show = function(req, res) {
  const postId = req.params.id;
  Order.findById(postId).populate('author').populate('tags').populate('imageNumber').populate({path:'comments.author', select:'email'}).populate('user_id_o').exec(function (err, admins) {
    res.send(admins)
    //res.send(admins)
  })
}
//Add record
orderController.store = function(req, res) {
  var datas = {
    "name": req.body.name,
    "alias": slugify(req.body.name,'-'),
    "note": req.body.note,
  };
  var post = new Order(datas);
  post.save(function(err, newPost){
    res.send(newPost)
  })
}
orderController.update = (req, res) => {
  var data = {
    nameCustomer: req.body.nameCustomer,
    nameReceive: req.body.nameReceive,
    emailCustomer: req.body.emailCustomer,
    phoneCustomer: req.body.phoneCustomer,
    provinceCustomer: req.body.provinceCustomer,
    districtCustomer: req.body.districtCustomer,
    addressCustomer: req.body.addressCustomer,
    status: req.body.status,
    note: req.body.note,
  }
  Order.findOne({'_id': req.params.id}, function(err, result){
    if(result){
      if(result.status!=2){
        Order.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, async function (err, results) {
          if(results.status==2){
            console.log(results.user_id)
            if(results.user_id!=''){
              console.log(results.user_id)
              var itemUser = await Users.findOne({_id: results.user_id})
              var p = 0
              if(itemUser.level==1){
                p = 15
              }else if(itemUser.level==2){
                p = 20
              }else if(itemUser.level==3){
                p = 25
              }else if(itemUser.level==4){
                p = 30
              }else if(itemUser.level==5){
                p = 35
              }else if(itemUser.level==6){
                p = 40
              }
              var itemWallet = await Wallet_v1.findOne({_id: itemUser.wallet_id})

              var commission = 0
              for(i=0;i<results.items.length;i++){
                var price_old = results.items[i][1].item.price_old
                if(results.items[i][1].item.price_sale!=0){
                  var price = results.items[i][1].item.price_sale
                }else{
                  var price = results.items[i][1].item.price
                }
                var com=parseFloat(results.items[i][1].qty)*(parseInt(price)-parseInt(price_old))*parseFloat(p/100)
                commission += com
              }
                var w_totalcommisstion = parseFloat(itemWallet.w_totalcommisstion)
                var w_milestones = parseFloat(itemWallet.w_milestones)
                w_milestones += commission
                w_totalcommisstion += commission
                var w_commission = 0
                w_commission += parseFloat(itemWallet.w_commission)
                w_commission += parseFloat(commission)
                var u_wallet = await Wallet_v1.findByIdAndUpdate(itemWallet._id, { $set: {w_commission: w_commission, w_totalcommisstion: w_totalcommisstion, w_milestones: w_milestones}}, { new: true }, function (err, wal) {
                  return wal
                })
                if(p<40){
                  if(itemUser.parent_id!=''){
                  var itemUserO = await Users.findOne({_id: itemUser.parent_id})
                  var itemWalletO = await Wallet_v1.findOne({_id: itemUserO.wallet_id})
                  var commission=0
                  for(i=0;i<results.items.length;i++){
                    var price_old = results.items[i][1].item.price_old
                    if(results.items[i][1].item.price_sale!=0){
                      var price = results.items[i][1].item.price_sale
                    }else{
                      var price = results.items[i][1].item.price
                    }
                    var com=parseFloat(results.items[i][1].qty)*(parseFloat(price)-parseFloat(price_old))*parseFloat(40-p)/100
                    commission += com
                  }
                  var w_totalcommisstion = itemWalletO.w_totalcommisstion
                  var w_milestones = itemWallet.w_milestones
                  w_milestones += commission
                  w_totalcommisstion += commission
                  var w_commission = 0
                  w_commission += parseFloat(itemWalletO.w_commission)
                  w_commission += parseFloat(commission)
                  var u_wallet = await Wallet_v1.findByIdAndUpdate(itemWalletO._id, { $set: {w_commission: w_commission, w_totalcommisstion: w_totalcommisstion, w_milestones: w_milestones}}, { new: true }, function (err, wal) {
                    return wal
                  })
                }
              }
            }else{
              console.log('Tự mua')
            }
          }
          res.send(results)
        })
      }else{
        Order.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
          res.send(results)
        })
      }

    }else{
        res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
    }
  })
}

orderController.delete = function(req, res) {
  Order.remove({_id: req.params.id}, function(err) {
    res.json({ "message": "Xóa sản phẩm thành công!" })
  })
}
orderController.remove = function(req, res){
  const request = req.body;
  Order.findByIdAndRemove(request._id, (err, post) => {
    if(err){
      res.send(err);
    }else{
      res.send({post: post, message:'deleted'})
    }
  })
}
module.exports = orderController;
