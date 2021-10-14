const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const Exchange = require("../../models/exchange")
const Users = require("../../models/user")
const Wallet_v1 = require("../../models/wallet_v1")
const Wallet_v2 = require("../../models/wallet_v2")
const Wallet_v3 = require("../../models/wallet_v3")
const Wallet_v4 = require("../../models/wallet_v4")
const Wallet_v5 = require("../../models/wallet_v5")
const Wallet_v6 = require("../../models/wallet_v6")
const url = require('url');
const exchangeController = {};
exchangeController.listAll = async function(req, res, next) {
  //res.send(req);
  const filter = {};
  const query = url.parse(req.url,true).query;
  //===================paginattion
  var perPage = 30
  var page = query.page || 1
  //===================end pagination
  //res.send(query);
  if(query){
    const keyword = new RegExp(query.keyword, 'i')
    filter.$or = [{ code: keyword }, { content: keyword }]
    filter.$and = [{user_id: req.params.id}]
    var posts = await Exchange.find(filter).skip((perPage * page) - perPage).limit(perPage).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('user_id').sort( { _id: -1 } )
      var count = await Exchange.find(filter).countDocuments()
      res.send({
          posts: posts,
          pages: Math.ceil(count / perPage),
          current: page,
      })
  }else{
    var posts = await Exchange.find({user_id: req.params.id}).skip((perPage * page) - perPage).limit(perPage).sort( { _id: -1 } )
    res.send({
      posts: posts,
      pages: Math.ceil(count / perPage)
    })
  }
}
exchangeController.apiDanhsachnaptien = async function(req, res, next){
  //res.send(req);
  const filter = {};
  const query = url.parse(req.url,true).query;
  //===================paginattion
  var perPage = 30
  var page = query.page || 1
  //===================end pagination
  //res.send(query);
  if(query){
    const keyword = new RegExp(query.keyword, 'i')
    filter.$or = [{ code: keyword }, { content: keyword }]
    filter.$and = [{type_exchange: 1,user_id: req.params.id}]
    var posts = await Exchange.find(filter).skip((perPage * page) - perPage).limit(perPage).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('user_id').sort( { _id: -1 } )
      var count = await Exchange.find(filter).countDocuments()
      res.send({
          posts: posts,
          pages: Math.ceil(count / perPage),
          current: page,
      })
  }else{
    var posts = await Exchange.skip((perPage * page) - perPage).limit(perPage).sort( { _id: -1 } )
    res.send({
      posts: posts,
      pages: Math.ceil(count / perPage)
    })
  }
}
exchangeController.danhsachnaptien = async function(req, res, next) {
    //res.send(req);
    const filter = {};
    const query = url.parse(req.url,true).query;
    //===================paginattion
    var perPage = 10
    var page = query.page || 1
    //===================end pagination
    //res.send(query);
    if(query){
      const keyword = new RegExp(query.keyword, 'i')
      filter.$or = [{ code: keyword }, { content: keyword }]
      filter.$and = [{type_exchange: 1}]
      var posts = await Exchange.find(filter).skip((perPage * page) - perPage).limit(perPage).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('user_id').sort( { _id: -1 } )
          var count = await Exchange.find(filter).countDocuments()
          res.send({
              posts: posts,
              pages: Math.ceil(count / perPage),
              current: page,
          })
    }else{
      var posts = await Exchange.skip((perPage * page) - perPage).limit(perPage).sort( { _id: -1 } )
      res.send({
        posts: posts,
        pages: Math.ceil(count / perPage)
      })
    }
}
exchangeController.danhsachdonhang = async function(req, res, next) {
    //res.send(req);
    const filter = {};
    const query = url.parse(req.url,true).query;
    //===================paginattion
    var perPage = 10
    var page = query.page || 1
    //===================end pagination
    //res.send(query);
    if(query){
      const keyword = new RegExp(query.keyword, 'i')
      filter.$or = [{ code: keyword }, { content: keyword }]
      filter.$and = [{type_exchange: 2}]
      var posts = await Exchange.find(filter).skip((perPage * page) - perPage).limit(perPage).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('user_id').sort( { _id: -1 } )
          var count = await Exchange.find(filter).countDocuments()
          res.send({
              posts: posts,
              pages: Math.ceil(count / perPage),
              current: page,
          })
    }else{
      var posts = await Exchange.skip((perPage * page) - perPage).limit(perPage).sort( { _id: -1 } )
      res.send({
        posts: posts,
        pages: Math.ceil(count / perPage)
      })
    }
}
exchangeController.danhsachchuyendiem = async function(req, res, next) {
    //res.send(req);
    const filter = {};
    const query = url.parse(req.url,true).query;
    //===================paginattion
    var perPage = 10
    var page = query.page || 1
    //===================end pagination
    //res.send(query);
    if(query){
      const keyword = new RegExp(query.keyword, 'i')
      filter.$or = [{ code: keyword }, { content: keyword }]
      filter.$and = [{type_exchange: 4}]
      var posts = await Exchange.find(filter).skip((perPage * page) - perPage).limit(perPage).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('user_id').sort( { _id: -1 } )
        var count = await Exchange.find(filter).countDocuments()
        res.send({
            posts: posts,
            pages: Math.ceil(count / perPage),
            current: page,
        })
    }else{
      var posts = await Exchange.skip((perPage * page) - perPage).limit(perPage).sort( { _id: -1 } )
      res.send({
        posts: posts,
        pages: Math.ceil(count / perPage)
      })
    }
}
exchangeController.list = async function(req, res, next) {
    //res.send(req);
    const filter = {};
    const query = url.parse(req.url,true).query;
    //===================paginattion
    var perPage = 10
    var page = query.page || 1
    //===================end pagination
    //res.send(query);
    if(query){
      const keyword = new RegExp(query.keyword, 'i')
      filter.$or = [{ code: keyword }, { content: keyword }]
      var posts = await Exchange.find(filter).skip((perPage * page) - perPage).limit(perPage).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('user_id').sort( { _id: -1 } )
          var count = await Exchange.find(filter).countDocuments()
          res.send({
              posts: posts,
              pages: Math.ceil(count / perPage),
              current: page,
          })
    }else{
      var posts = await Exchange.find({}).skip((perPage * page) - perPage).limit(perPage).sort( { _id: -1 } )
      res.send({
        posts: posts,
        pages: Math.ceil(count / perPage)
      })
    }
};
exchangeController.getAll = function(req, res, next) {
    const filter = {};
    Exchange.find({}).exec((err, post) => {
        res.send(post)
    })
};
exchangeController.show = function(req, res) {
    const postId = req.params.id;
    Exchange.findById(postId).populate("user_id").exec(function (err, admins) {
      res.send(admins);
    });
};
//Add record
exchangeController.store = function(req, res) {
  var data = {};
  if(parseInt(req.body.number_epay)==0){
    res.send({
      status: 0
    })
  }
  var datapost = new Exchange(data);
  datapost.exchange_rate = 23160;
  datapost.number_epay = parseInt(req.body.number_epay);
  datapost.number_monney = parseInt(req.body.number_epay)*23160;
  datapost.type_wallet = 1;
  datapost.type_exchange = 1;
  datapost.math = "+";
  datapost.user_id = req.body.user_id;
  datapost.save(function(err, result){
    if(err){
      res.send({
        status: 0
      })
    }else{
      res.send({
        status: 1
      })
    }
  })
};
exchangeController.storeWallet6 = function(req, res) {
  var data = {};
  if(parseInt(req.body.number_epay)==0){
    res.send({
      status: 0
    })
  }
  var datapost = new Exchange(data);
  datapost.exchange_rate = 23160;
  datapost.number_epay = parseInt(req.body.number_epay);
  datapost.number_monney = parseInt(req.body.number_epay)*23160;
  datapost.type_wallet = 6;
  datapost.type_exchange = 6;
  datapost.math = "+";
  datapost.user_id = req.body.user_id;
  datapost.save(function(err, result){
    if(err){
      res.send({
        status: 0
      })
    }else{
      res.send({
        status: 1
      })
    }
  })
};
exchangeController.update = (req, res) => {
    var data = {
        name: req.body.name,
        description: req.body.description,
        parent_id: req.body.parent_id,
        imageNumber: req.body.imageNumber,
        imagePath: req.body.imagePath,
    }
    Exchange.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            Exchange.findByIdAndUpdate(req.params.id, { $set: data}, { new: true },async function (err, results) {
              if(results.status==1){
                var findItemWallet = await Wallet_v1.findOne({_id: results.wallet_id})
                var dataw = {}
                var w_hh = parseFloat(res_w.w_hh) - parseFloat(results.number_monney)
                dataw.w_hh = w_hh
                var updateWallet = Wallet_v1.findByIdAndUpdate(res_w._id, { $set: dataw}, { new: true }, function (err, res_ws) {
                  return res_ws
                })
                res.send(updateWallet)
              }
            })
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    });
}
exchangeController.update_status = (req, res) => {
  var data = {
      status: req.body.status,
  }
  Exchange.findOne({'_id': req.params.id}, function(err, result){
    if(result){
      Exchange.findByIdAndUpdate(req.params.id, { $set: data}, { new: true },async function (err, results) {
        var itemUser = await Users.findById(result.user_id).populate('wallet_id').populate('wallet_id2').populate('wallet_id3')
        if(results.status==1){
          if(results.hinhthucthanhtoan==2){
            var dataw1 = {
              w_epay: 0
            }
            dataw1.w_epay = parseFloat(results.number_epay)+parseFloat(itemUser.wallet_id.w_epay)
            var updateWallet3 = await Wallet_v3.findByIdAndUpdate(itemUser.wallet_id3, { $set: {w_epay: Math.round(parseFloat(dataw1.w_epay) * 1000)/1000}}, { new: true }, function (err, res_ws) {
                return res_ws
            })
            res.send({
                findItemWallet1: findItemWallet1
            })
          }else{
            var dataw1 = {
              w_epay: 0
            }
            var epay1 = parseFloat(results.number_epay)*0.8
            dataw1.w_epay = parseFloat(epay1)+parseFloat(itemUser.wallet_id.w_epay)
            var updateWallet1 = await Wallet_v1.findByIdAndUpdate(itemUser.wallet_id._id, { $set: {w_epay: Math.round(parseFloat(dataw1.w_epay) * 1000)/1000}}, { new: true }, function (err, res_ws) {
                return res_ws
            })
            // =========================================
            var findItemWallet2 = await Wallet_v2.findOne({_id: results.wallet_id2})
            var dataw2 = {
                w_epay: 0
            }
            var epay2 = parseFloat(results.number_epay)*0.2
            dataw2.w_epay = parseFloat(epay2)+parseFloat(itemUser.wallet_id2.w_epay)
            var updateWallet2 = await Wallet_v2.findByIdAndUpdate(itemUser.wallet_id2._id, { $set: {w_epay: Math.round(parseFloat(dataw2.w_epay) * 1000)/1000}}, { new: true }, function (err, res_ws) {
              return res_ws
            })
            res.send({
                mes: 'ok',
                statust: 1,
                updateWallet1: updateWallet1,
                updateWallet2: updateWallet2
            })
          }
        }
      })
    }
  })
}
exchangeController.update_status_wallet3 = async (req, res) => {
  var itemUser = await Users.findOne({_id: req.body.user_id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('wallet_id4').populate('wallet_id5').populate('wallet_id6')
  console.log(itemUser)
  var number_epay = parseFloat((parseFloat(itemUser.wallet_id2.w_epay)+parseFloat(itemUser.wallet_id4.w_epay))*0.002)
  var data = {
      status: 1,
  }
  var datapost = new Exchange(data);
  datapost.exchange_rate = 23160;
  datapost.number_epay = Math.round(parseFloat(number_epay) * 1000)/1000;
  datapost.number_monney = parseInt(datapost.number_epay)*23160;
  datapost.type_wallet = 3;
  datapost.type_exchange = 3;
  datapost.math = "+";
  datapost.user_id = req.body.user_id;
  datapost.save(async function(err, result){
    if(err){
      res.send({
        status: 0
      })
    }else{
      var itemUser = await Users.findOne({_id: result.user_id}).populate('wallet_id').populate('wallet_id2').populate('wallet_id3').populate('wallet_id4').populate('wallet_id5').populate('wallet_id6')
      var epay3 = parseFloat(result.number_epay)+parseFloat(itemUser.wallet_id3.w_epay)
      var updateWallet3 = await Wallet_v3.findByIdAndUpdate(itemUser.wallet_id3._id, { $set: {w_epay: Math.round(epay3 * 1000)/1000}}, { new: true }, function (err, res_ws) {
        return res_ws
      })
      var updateUser = await Users.findByIdAndUpdate(itemUser._id, { $set: {check_update_wallet: 1}}, { new: true }, function (err, res_ws) {
        return res_ws
      })
      res.send({
        status: 1
      })
    }
  })
}
exchangeController.delete = function(req, res) {
    Exchange.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa sản phẩm thành công!" })
    });
  };
exchangeController.remove = function(req, res){
    const request = req.body;
    Exchange.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
//get data with url and link
exchangeController.getDataUrl = function(req, res){
    Exchange.aggregate([
        { "$project": {
            "id": "$_id",
            "value": "$slug",
            "label": "$name"
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
// reset Exchange
exchangeController.removeAll = async function(req, res){
  var dataE = await Exchange.find({});
  dataE.forEach(item => {
    Exchange.findByIdAndRemove(item._id, (err, post) => {
        return post
    });
  });
  var dataW1 = await Wallet_v1.find({});
  dataW1.forEach(item => {
    Wallet_v1.findByIdAndRemove(item._id, (err, post) => {
        return post
    });
  });
  var dataW2 = await Wallet_v2.find({});
  dataW2.forEach(item => {
    Wallet_v2.findByIdAndRemove(item._id, (err, post) => {
        return post
    });
  });
  var dataW3 = await Wallet_v3.find({});
  dataW3.forEach(item => {
    Wallet_v3.findByIdAndRemove(item._id, (err, post) => {
        return post
    });
  });
  var dataU = await Users.find({});
  dataU.forEach(item => {
    Users.findByIdAndRemove(item._id, (err, post) => {
        return post
    });
  });
  res.send({a: "jj"})
}
module.exports = exchangeController;
