const express = require('express')
var bcrypt = require('bcryptjs')
const slugify = require('slugify')
slugify.extend({ 'đ': 'd' })
const Users = require("../../models/user")
const Wallet_v1 = require("../../models/wallet_v1")
const Wallet_v2 = require("../../models/wallet_v2")
const Wallet_v3 = require("../../models/wallet_v3")
const Wallet_v4 = require("../../models/wallet_v4")
const Wallet_v5 = require("../../models/wallet_v5")
const Wallet_v6 = require("../../models/wallet_v6")
var dateTime = require('node-datetime')
const url = require('url')
const usersController = {}
usersController.list = function(req, res, next) {
  const filter = {};
  const query = url.parse(req.url,true).query;
  var perPage = query.perPage || 10
  var page = query.page || 1
  if(query){
    const keyword = new RegExp(query.keyword, 'i');
    filter.$or = [{name: keyword}, {description: keyword}, {email: keyword}, {username: keyword}, {introduce: keyword}]
    Users.find(filter).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('wallet_id4').populate('wallet_id5').populate('wallet_id6').sort( { _id: -1 } )
        .skip((perPage * page) - perPage)
        .limit(perPage).populate('imageNumber').exec((err, posts) => {
      Users.find(filter).countDocuments().exec(function(err, count) {
        res.send({
          posts: posts,
          current: page,
          pages: Math.ceil(count / perPage),
          count: count,
        })
      })
    });
  }else{
    Users.populate('imageNumber').populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('wallet_id4').populate('wallet_id5').populate('wallet_id6').sort( { _id: -1 } ).exec((err, post) => {
      res.send(post)
    });
  }
}
usersController.getAllSelect = function(req, res, next) {
  Users.aggregate([
    { $match: { "active" : 1 } },
    { $project: {
      "value": "$_id",
      "label": "$name"
    }}
  ]).exec((err, post) => {
    res.send(post)
  })
  //.find({level: 6})
}
usersController.getAll = async function(req, res, next) {
  let data = await Users.find({}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('wallet_id4').populate('wallet_id5').populate('wallet_id6')
  res.send(data)
}
usersController.show = function(req, res) {
  const postId = req.params.id;
  Users.findById(postId).populate('imageNumber').populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('wallet_id4').populate('wallet_id5').populate('wallet_id6').exec(function(err, admins){
    res.send(admins)
  })
}
//Add record
usersController.store = async function(req, res) {
  var data_wallet_v1 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v1 = new Wallet_v1(data_wallet_v1)
  var dataW1 = post_wallet_v1.save(function(err, result){
    return result
  })
  //
  var data_wallet_v2 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v2 = new Wallet_v2(data_wallet_v2)
  var dataW2 = await post_wallet_v2.save(function(err, result){
    return result
  })
  //
  var data_wallet_v3 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v3 = new Wallet_v3(data_wallet_v3)
  var dataW3 = await post_wallet_v3.save(function(err, result){
    return result
  })
  var data_wallet_v4 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v4 = new Wallet_v4(data_wallet_v4)
  var dataW4 = await post_wallet_v4.save(function(err, result){
    return result
  })
  var data_wallet_v5 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v5 = new Wallet_v5(data_wallet_v5)
  var dataW5 = await post_wallet_v5.save(function(err, result){
    return result
  })
  var data_wallet_v6 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v6 = new Wallet_v6(data_wallet_v6)
  var dataW6 = await post_wallet_v6.save(function(err, result){
    return result
  })
  var cdt = dateTime.create()
  var dt = cdt.format('d-m-Y H:M:S')
  var pastNow = cdt.getTime()
  var tracking = pastNow+Math.random().toString(36).substring(7)

  var datas = {
    "name": req.body.name,
    "firstname": req.body.firstname,
    'username': req.body.username,
    "lastname": req.body.lastname,
    "gender": parseInt(req.body.gender),
    "birthday": req.body.birthday,
    "imagePath": req.body.imagePath,
    "imageNumber": req.body.imageNumber,
    "description": req.body.description,
    "level": parseInt(req.body.level),
    "zalo": req.body.zalo,
    "parent_id": req.body.parent_id,
    "facebook": req.body.facebook,
    "email": req.body.email,
    "phone": req.body.phone,
    "country": parseInt(req.body.country),
    "province": parseInt(req.body.province),
    "district": parseInt(req.body.district),
    "address": req.body.address,
    "wallet_id": post_wallet_v1._id,
    "wallet_id2": post_wallet_v2._id,
    "wallet_id3": post_wallet_v3._id,
    "wallet_id4": post_wallet_v4._id,
    "wallet_id5": post_wallet_v5._id,
    "wallet_id6": post_wallet_v6._id,
    "datatime": dt,
    "tracking": tracking,
    "arr_parent": []
  }
  if(req.body.parent_id==''){
    datas.parent_id = null
  }
  if(req.body.password!=''){
      var hashedPassword = bcrypt.hashSync(req.body.password, 8)
      datas.password = hashedPassword
  }
  if(datas.parent_id==null){
    datas.introduce = 'vietnamepay'
  }else{
    var itemUser = await Users.findOne({_id: datas.parent_id})

    //datas.arr_parent[dataParent_introduce.arr_parent.length] = dataParent_introduce._id
    if(itemUser){
      var arr_parent = itemUser.arr_parent
      if(itemUser.arr_parent.length<15){
        arr_parent[itemUser.arr_parent.length] = itemUser._id
      }else{
        itemUser.arr_parent.shift()
        arr_parent[arr_parent.length] = itemUser._id
      }
      datas.arr_parent = arr_parent
      datas.introduce = itemUser.username
    }
  }

  console.log(datas)
  var post = new Users(datas)
  console.log(post)
  post.save(function(err, newPost) {
      res.send(newPost)
  })
}
usersController.update = async (req, res) => {
  var datas = {
    "name": req.body.name,
    "firstname": req.body.firstname,
    'username': req.body.username,
    "lastname": req.body.lastname,
    "gender": parseInt(req.body.gender),
    "birthday": req.body.birthday,
    "imagePath": req.body.imagePath,
    "imageNumber": req.body.imageNumber,
    "description": req.body.description,
    "level": parseInt(req.body.level),
    "zalo": req.body.zalo,
    "parent_id": req.body.parent_id,
    "facebook": req.body.facebook,
    "email": req.body.email,
    "phone": req.body.phone,
    "country": parseInt(req.body.country),
    "province": parseInt(req.body.province),
    "district": parseInt(req.body.district),
    "address": req.body.address,
    "arr_parent": []
  }
  if(req.body.parent_id==''){
    datas.parent_id = null
  }
  if(req.body.password){
      var hashedPassword = bcrypt.hashSync(req.body.password, 8)
      datas.password = hashedPassword
  }
  if(datas.parent_id==null){
    datas.introduce = 'vietnamepay'
  }else{
    var itemUser = await Users.findOne({_id: datas.parent_id})
    if(itemUser){
      var arr_parent = itemUser.arr_parent
      if(itemUser.arr_parent.length<6){
        arr_parent[itemUser.arr_parent.length] = itemUser._id
      }else{
        itemUser.arr_parent.shift()
        arr_parent[arr_parent.length] = itemUser._id
      }
      datas.arr_parent = arr_parent
      datas.introduce = itemUser.username
    }
  }
  console.log(datas)
  var itemFindData = await Users.findOne({ '_id': req.params.id }).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')

  if(itemFindData){
    var result = Users.findByIdAndUpdate(req.params.id, { $set: datas }, { new: true }, function(err, results) {
      return results
    })
  }
  res.send(itemFindData)
}
usersController.updateApp = async (req, res) => {
  var datas = {
    "name": req.body.firstname+" "+req.body.lastname,
    "firstname": req.body.firstname,
    'username': req.body.username,
    "lastname": req.body.lastname,
    "email": req.body.email,
    "phone": req.body.phone,
    "birthday": req.body.birthday,
    "gender": req.body.gender,
  }
  var itemFindData = await Users.findOne({ '_id': req.params.id }).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')

  if(itemFindData){
    Users.findByIdAndUpdate(req.params.id, { $set: datas }, { new: true }, function(err, results) {
      if(err){
        res.send({status: 0})
      }else{
        res.send({status: 1})
      }
    })
  }else{
    res.send({status: 0})
  }
}
usersController.delete = function(req, res) {
    Users.remove({ _id: req.params.id }, function(err) {
        res.json({ "message": "Xóa sản phẩm thành công!" })
    });
};
usersController.remove = function(req, res) {
    //const request = req.body;
    Users.findByIdAndRemove(req.params.id, (err, post) => {
        if (err) {
            res.send(err);
        } else {
            res.send({ post: post, message: 'deleted' });
        }
    });
}
usersController.checkStatus = async function(req, res, next){
    const itemUser = await Users.findOne({_id: req.body.id})
    if(req.body.type=="active"){
      if(itemUser.active==1){
          var data =  {active:0}
          var itempost = await Users.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
      }else{
          var data =  {active:1}
          var itempost = await Users.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
      }
    }
    res.send(itempost)
}

// 
usersController.storeApp = async function(req, res) {
  var data_wallet_v1 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v1 = new Wallet_v1(data_wallet_v1)
  var dataW1 = post_wallet_v1.save(function(err, result){
    return result
  })
  //
  var data_wallet_v2 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v2 = new Wallet_v2(data_wallet_v2)
  var dataW2 = await post_wallet_v2.save(function(err, result){
    return result
  })
  //
  var data_wallet_v3 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v3 = new Wallet_v3(data_wallet_v3)
  var dataW3 = await post_wallet_v3.save(function(err, result){
    return result
  })
  var data_wallet_v4 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v4 = new Wallet_v4(data_wallet_v4)
  var dataW4 = await post_wallet_v4.save(function(err, result){
    return result
  })
  var data_wallet_v5 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v5 = new Wallet_v5(data_wallet_v5)
  var dataW5 = await post_wallet_v5.save(function(err, result){
    return result
  })
  var data_wallet_v6 = {
    w_commission: 0,
    w_epay: 0,
    w_consumption: 0,
    w_akie: 0,
  }
  var post_wallet_v6 = new Wallet_v6(data_wallet_v6)
  var dataW6 = await post_wallet_v6.save(function(err, result){
    return result
  })
  var cdt = dateTime.create()
  var dt = cdt.format('d-m-Y H:M:S')
  var pastNow = cdt.getTime()
  var tracking = pastNow+Math.random().toString(36).substring(7)
  var datas = {
    "name": req.body.firstname + " " +req.body.lastname,
    "firstname": req.body.firstname,
    'username': req.body.username,
    "lastname": req.body.lastname,
    "introduct": req.body.introduct,
    "email": req.body.email,
    "phone": req.body.phone,
    "wallet_id": post_wallet_v1._id,
    "wallet_id2": post_wallet_v2._id,
    "wallet_id3": post_wallet_v3._id,
    "wallet_id4": post_wallet_v4._id,
    "wallet_id5": post_wallet_v5._id,
    "wallet_id6": post_wallet_v6._id,
    "datatime": dt,
    "tracking": tracking,
    "arr_parent": []
  }
  if(req.body.parent_id==''){
    datas.parent_id = null
  }
  if(req.body.password!=''){
      var hashedPassword = bcrypt.hashSync(req.body.password, 8)
      datas.password = hashedPassword
  }
  var itemUser = await Users.findOne({username: req.body.username})
  if(itemUser){
    var arr_parent = itemUser.arr_parent
    if(itemUser.arr_parent.length<6){
      arr_parent[itemUser.arr_parent.length] = itemUser._id
    }else{
      itemUser.arr_parent.shift()
      arr_parent[arr_parent.length] = itemUser._id
    }
    datas.arr_parent = arr_parent
    datas.introduce = itemUser.username
  }else{
    datas.introduce = "vietnamepay"
  }
  var post = new Users(datas)
  post.save(function(err, newPost) {
    res.send(newPost)
  })
}
module.exports = usersController
