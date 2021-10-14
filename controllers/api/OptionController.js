
const express = require('express')
const slugify = require('slugify')
slugify.extend({'đ': 'd'})
const url = require('url')
const Option = require('../../models/option')
const optionController = {}
optionController.list = function(req, res, next){
    const filter = {}
    const query = url.parse(req.url,true).query
    //===================paginattion
    var perPage = query.perPage || 10
    var page = query.page || 1

    if(query){
        const keyword = new RegExp(query.keyword, 'i')
        filter.$or = [{name: keyword}]
        filter.parent_id = null
        Option.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('imageNumber')
        .exec((err, posts) => {
            Option.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        })
    }else{
        Option.populate('author').populate('tags').exec((err, post) => {
            res.send(post)
        })
    }
}
optionController.getAlls = function(req, res, next) {
    Option.find({}).exec((err, post) => {
        res.send(post)
    })
}
optionController.getAllChild = function(req, res, next){
  const filter = {}
  const query = url.parse(req.url,true).query
  Option.find(query).exec((err, post)=>{
    res.send(post)
  })
}
optionController.getAllParent = async function(req, res, next){
  var post = await Option.find({parent_id: null})
  if(post.length>0){
    for(i=0;i<post.length;i++){
      post.dataChild = await Option.find({parent_id: post[i]._id})
    }
  }
  res.send(post)
}
optionController.getAll = function(req, res, next) {
    const filter = {}
    const query = url.parse(req.url,true).query
    if(query.author){
        filter.author = query.author;
    }
    Option.find(filter).exec((err, post) => {
        res.send(post)
    })
}
optionController.show = async function(req, res) {

    const postId = await req.params.id
    const data = await Option.findById(postId).populate('imageNumber')
    data.dataChild = await Option.find({parent_id: data._id})
    console.log(data)
    res.send({
        data: data,
    })
}
optionController.create = function(req, res) {
    res.send({message:'View tạo tài khoản'})
};
//Add record
optionController.store = function(req, res) {
    var datas = {
        "name": req.body.name,
        "type": req.body.type,
        "sort": req.body.sort,
        "parent_id": req.body.parent_id,
        "imageNumber": req.body.imageNumber,
        "imagePath": req.body.imagePath,
    }
    if(req.body.parent_id==''){
      datas.parent_id = null
    }
    var post = new Option(datas)
    post.save(function(err, newPost){
        res.send(newPost)
    })
}
optionController.update = function(req, res) {
    var messenger = {};
    var data = {
      "name": req.body.name,
      "type": req.body.type,
      "sort": req.body.sort,
      "parent_id": req.body.parent_id,
      "imageNumber": req.body.imageNumber,
      "imagePath": req.body.imagePath,
    }
    if(req.body.parent_id==''){
      datas.parent_id = null
    }
    Option.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            Option.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            });
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật tin tức"});
        }
    });
}
optionController.delete = (req, res) => {
  Option.remove({_id: req.params.id}, function(err) {
    res.json({ "message": "Xóa tin tức thành công!" })
  })
}
optionController.remove = function(req, res){
  Option.findByIdAndRemove(req.params.id, (err, post) => {
    if(err){
        res.send(err)
    }else{
        res.send({post: post, message:'deleted'})
    }
  })
}
optionController.checkHome = async function(req, res){
    const itemstyleproduct = await New.findOne({_id: req.body.id})
    if(req.body.type=="home"){
        if(itemstyleproduct.home==1){
            var data = await {home:0,checkHome:'false'}
            var itempost = await New.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {home:1,checkHome:'true'}
            var itempost = await New.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
optionController.checkFocus = async function(req, res){
    const itemstyleproduct = await New.findOne({_id: req.body.id})
    if(req.body.type=="focus"){
        if(itemstyleproduct.focus==1){
            var data = await {focus:0,checkFocus:'false'}
            var itempost = await New.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {focus:1,checkFocus:'true'}
            var itempost = await New.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
//get data with url and link
optionController.getDataUrl = function(req, res){
    New.aggregate([
        { "$project": {
            "id": "$_id",
            "value": "$slug",
            "label": "$name"
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
module.exports = optionController
