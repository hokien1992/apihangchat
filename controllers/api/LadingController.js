const express = require('express')
const slugify = require('slugify')
var axios = require('axios');
slugify.extend({'đ': 'd'})
const Order = require("../../models/order")
const Users = require("../../models/user")
const Lading = require("../../models/lading")
const dateTime = require('node-datetime')
const url = require('url')
const ladingController = {}
ladingController.list = function(req, res, next) {
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
    Lading.find(filter)
    .skip((perPage * page) - perPage)
    .limit(perPage).sort({_id: -1}).exec((err, posts) => {
      Lading.find(filter).countDocuments().exec(function(err, count) {
        res.send({
          posts: posts,
          current: page,
          pages: Math.ceil(count / perPage),
          count:count,
        })
      })
    })
  }else{
    Lading.find({}).exec((err, post) => {
      res.send(post)
    })
  }
}

ladingController.listWithOrder = async function(req, res, next) {
  const query = url.parse(req.url,true).query
  var data = await Lading.find({order_id: query.order_id}).sort({_id: -1})
  res.send({data:data})
}
ladingController.store = function(req, res, next) {
  let data = req.body
  let postdata = new Lading(data)
  postdata.status = data.statusLading
  postdata.order_id = data.order_id
  postdata.save( async function(error, result){
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
    let itemlading = await Lading.findOne({order_id: result.order_id})
    console.log(itemlading)
    var datav = {
      "TYPE": result.type,
      "ORDER_NUMBER": itemlading.ORDER_NUMBER,
      "NOTE": result.note
    }
    var configs = {
      method: 'post',
      url: 'https://partner.viettelpost.vn/v2/order/createOrder',
      data: datav,
      headers: {
        'Content-Type': 'application/json',
        'Token': instanceLogin.data.data.token
      }
    }
    let instance = await axios(configs)
    console.log(instance.data)
    res.send(result)
  })
}
module.exports = ladingController;
