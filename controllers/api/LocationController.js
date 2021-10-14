const express = require('express')
const slugify = require('slugify')
slugify.extend({'đ': 'd'})
const Location = require("../../models/location")
const url = require('url')
const locationController = {}
const axios = require('axios')
locationController.listDataWhere = async function(req, res, next){
    const query = url.parse(req.url,true).query

    if(query.parent){
        var data = await Location.find({parent_id: query.parent})
    }else{
        var data = await Location.find({parent_id: "null"})
    }
    res.send(data)
}
locationController.list = function(req, res, next) {
    const filter = {}
    const query = url.parse(req.url,true).query
    //===================paginattion
    var perPage = query.perPage || 10
    var page = query.page || 1
    //===================end pagination
    if(query){
        const keyword = new RegExp(query.keyword, 'i')
        filter.$or = [{name: keyword}, {description:keyword}]
        Location.aggregate([
          { $match : { level : { $exists: true }} },
          { $project: {
                "_id": "$_id",
                "name": "$COUNTRY_NAME",
                "code": "$COUNTRY_CODE",
                "country_id": "$COUNTRY_ID",
            }
          }
        ])
        .skip((perPage * page) - perPage)
        .sort({ _id: -1 })
        .limit(perPage).exec((err, posts) => {
            Location.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        })
    }else{
        Location.find({}).exec((err, post) => {
            res.send(post)
        })
    }
}
locationController.getAll = function(req, res, next) {
    Location.aggregate([
        { "$project": {
            "value": "$_id",
            "label": "$name",
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
locationController.show = function(req, res) {
  const postId = req.params.id;
  Location.findById(postId).populate('author').populate('tags').populate('imageNumber').populate({path:'comments.author', select:'email'}).exec(function (err, admins) {
    res.send(admins)
  })
}
//Add record
locationController.store = async function(req, res) {
  var datas = {
      name: req.body.name,
      parent_id: req.body.parent_id,
      level: req.body.level,
  }
  if(req.body.level==0){
    var itemLocation = await Location.findOne({level: 0}).sort({ COUNTRY_ID: -1 })
    console.log(itemLocation)
    if(itemLocation){
      datas.COUNTRY_ID = parseInt(itemLocation.COUNTRY_ID)+1
    }else{
      datas.COUNTRY_ID = 1
    }
    datas.COUNTRY_CODE = req.body.code
    datas.COUNTRY_NAME = req.body.name
  }
  var post = new Location(datas);
    post.save(function(err, newPost){
      console.log(newPost)
      res.send(newPost)
    })
}
locationController.update = (req, res) => {
  var data = {
    "name": req.body.name,
    "parent_id": req.body.parent_id,
    "level": req.body.level,
  }
  Location.findOne({'_id': req.params.id}, function(err, result){
      if(result){
          Location.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
              res.send(results);
          });
      }else{
          res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
      }
  })
}
locationController.remove = function(req, res){
  Location.findByIdAndRemove(req.params.id, (err, post) => {
    if(err){
      res.send(err)
    }else{
      res.send({post: post, message:'deleted'})
    }
  })
}
locationController.getFromVietelPost = async function(req, res){
  var data = await axios.get('https://partner.viettelpost.vn/v2/categories/listWards?districtId=-1')
  .then(response => {
    return response.data
  })
  .catch(error => {
    console.log(error);
  });
  for(i=0;i<data.data.length;i++){
    var datap = data.data[i]
    var post = new Location(datap)
    await post.save(function(err, newPost){
      return newPost
    })
  }
  res.send(data)
}
locationController.listCountry = async function(req, res){
  var province = await Location.aggregate([
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
  res.send(province)
}
locationController.listProvince = async function(req, res){
  const query = url.parse(req.url,true).query
  if(query.coutry){
    var province = await Location.aggregate([
      { $match : { PROVINCE_NAME : { $exists: false }, COUNTRY_ID : parseInt(query.coutry) } },
      { $project: {
          "_id": "$_id",
          "name": "$PROVINCE_NAME",
          "province_name": "$PROVINCE_NAME",
          "province_code": "$PROVINCE_CODE",
          "province_id": "$PROVINCE_ID",
          "label": "$PROVINCE_NAME",
          "code": "$PROVINCE_CODE",
          "id": "$PROVINCE_ID",
          "idcountry": "$COUNTRY_ID",
          "value": "$PROVINCE_ID",
        }
      },
      { $sort: { DISTRICT_ID: -1 } }
    ])
  }else{
    // Danh sách tỉnh thành
    var province = await Location.aggregate([
      { $match : { PROVINCE_CODE : { $exists: true }} },
      { $project: {
            "_id": "$_id",
            "province_name": "$PROVINCE_NAME",
            "province_code": "$PROVINCE_CODE",
            "province_id": "$PROVINCE_ID",
            "label": "$PROVINCE_NAME",
            "code": "$PROVINCE_CODE",
            "id": "$PROVINCE_ID",
            "idcountry": "$COUNTRY_ID",
            "value": "$PROVINCE_ID",
        }
      }
    ])
  }
    res.send({
        province: province,
        status: 1
    })
}
locationController.listDistrict = async function(req, res){
  const query = url.parse(req.url,true).query
  var district = await Location.aggregate([
    { $match : { PROVINCE_CODE : { $exists: false }, PROVINCE_ID : parseInt(query.province) } },
    { $project: {
          "_id": "$_id",
          "name": "$DISTRICT_NAME",
          "label": "$DISTRICT_NAME",
          "code": "$DISTRICT_CODE",
          "id": "$DISTRICT_ID",
          "value": "$DISTRICT_ID",
      }
    },
    { $sort: { DISTRICT_ID: -1 } }
  ])
  res.send({
    district: district,
    status: 1
  })
}
locationController.listWards = async function(req, res){
  const query = url.parse(req.url,true).query
  var wards = await Location.aggregate([
    { $match : { PROVINCE_ID : { $exists: false }, DISTRICT_ID : parseInt(query.district) } },
    { $project: {
          "_id": "$_id",
          "name": "$WARDS_NAME",
          "label": "$WARDS_NAME",
          "code": "$WARDS_CODE",
          "id": "$WARDS_ID",
          "value": "$WARDS_ID",
      }
    },
    { $sort: { WARDS_ID: -1 } }
  ])
  res.send({
    wards: wards,
    status: 1
  })
}
locationController.updateProvince = async function(req, res, next){
  var province = await Location.aggregate([
    { $match : { PROVINCE_CODE : { $exists: true }} }
  ])
  for(i=0;i<province.length;i++){
    var de = Location.findByIdAndRemove(province[i]._id, (err, post) => {
      if(err){
        return err
      }else{
        return {post: post, message:'deleted'}
      }
    })
  }
  res.send({ok: 'ok'})
}
locationController.address = async function(req, res){
  const query = url.parse(req.url,true).query
  var country = await Location.findOne({COUNTRY_ID: query.country})
  var province = await Location.aggregate([
    { $match : { PROVINCE_NAME : { $exists: true }, PROVINCE_ID : parseInt(query.province)} }
  ])
  var district = await Location.aggregate([
    { $match : { DISTRICT_NAME : { $exists: true }, DISTRICT_ID : parseInt(query.district)} }
  ])
  var wards = await Location.aggregate([
    { $match : { WARDS_NAME : { $exists: true }, WARDS_ID : parseInt(query.wards)} }
  ])
  var address = wards[0].WARDS_NAME+', '+district[0].DISTRICT_NAME+', '+province[0].PROVINCE_NAME+', '+country.name
  res.send({address: address})
}
module.exports = locationController
