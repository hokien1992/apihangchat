
const express = require('express')
const slugify = require('slugify')
slugify.extend({'đ': 'd'})
const url = require('url')
const Optionproduct = require('../../models/option_product')
const optionproductController = {}
optionproductController.list = function(req, res, next){
    const filter = {}
    const query = url.parse(req.url,true).query
    //===================paginattion
    var perPage = query.perPage || 10
    var page = query.page || 1

    if(query){
        const keyword = new RegExp(query.keyword, 'i')
        filter.$or = [{name: keyword}]
        filter.parent_id = ''
        Optionproduct.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('imageNumber')
        .exec((err, posts) => {
            Optionproduct.find(filter).countDocuments().exec(function(err, count) {
                posts.test = {name: "ok"}
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        })
    }else{
        Optionproduct.populate('author').populate('tags').exec((err, post) => {
            res.send(post)
        })
    }
}
optionproductController.getAlls = function(req, res, next) {
    Optionproduct.find({}).exec((err, post) => {
        res.send(post)
    })
}
optionproductController.getAllChild = function(req, res, next){
  const filter = {}
  const query = url.parse(req.url,true).query
  Optionproduct.find(query).exec((err, post)=>{
    res.send(post)
  })
}
optionproductController.getAllParent = async function(req, res, next){
  var post = await Optionproduct.find({parent_id: ''})
  if(post.length>0){
    for(i=0;i<post.length;i++){
      post.dataChild = await Optionproduct.find({parent_id: post[i]._id})
    }
  }
  res.send(post)
}
optionproductController.getAll = function(req, res, next) {
    // const filter = {}
    // const query = url.parse(req.url,true).query
    // if(query.author){
    //     filter.author = query.author;
    // }
    Optionproduct.find({}).exec((err, post) => {
        res.send(post)
    })
}
optionproductController.show = async function(req, res) {

    const postId = await req.params.id
    const data = await Optionproduct.findById(postId).populate('imageNumber')
    data.dataChild = await Optionproduct.find({parent_id: data._id})
    console.log(data)
    res.send({
        data: data,
    })
}
optionproductController.create = function(req, res) {
    res.send({message:'View tạo tài khoản'})
}
//Add record
optionproductController.store = function(req, res) {
    var datas = {
        "name": req.body.name,
        "type": req.body.type,
        "sort": req.body.sort,
        "parent_id": req.body.parent_id,
        "imageNumber": req.body.imageNumber,
        "imagePath": req.body.imagePath,
    }
    var post = new Optionproduct(datas)
    post.save(function(err, newPost){
        res.send(newPost)
    })
}
optionproductController.update = function(req, res) {
    var messenger = {};
    var data = {
        name: req.body.name,
        description: req.body.description,
    }
    Optionproduct.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            Optionproduct.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            });
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật tin tức"});
        }
    });
}
optionproductController.delete = (req, res) => {
  Optionproduct.remove({_id: req.params.id}, function(err) {
    res.json({ "message": "Xóa tin tức thành công!" })
  })
}
optionproductController.remove = function(req, res){
  Optionproduct.findByIdAndRemove(req.params.id, async (err, post) => {
    if(post.parent_id==null){
      let dataoption = await Optionproduct.find({parent_id: post._id})
      for (var i = 0; i < dataoption.length; i++) {
        var optionremove = Optionproduct.findByIdAndRemove(dataoption[i]._id, async (err, post) => {
          return "ok"
        })
      }
      res.send(dataoption)
    }
  })
}
optionproductController.checkHome = async function(req, res){
    const itemstyleproduct = await Optionproduct.findOne({_id: req.body.id})
    if(req.body.type=="home"){
        if(itemstyleproduct.home==1){
            var data = await {home:0,checkHome:'false'}
            var itempost = await Optionproduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {home:1,checkHome:'true'}
            var itempost = await Optionproduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
optionproductController.checkFocus = async function(req, res){
    const itemstyleproduct = await Optionproduct.findOne({_id: req.body.id})
    if(req.body.type=="focus"){
        if(itemstyleproduct.focus==1){
            var data = await {focus:0,checkFocus:'false'}
            var itempost = await Optionproduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {focus:1,checkFocus:'true'}
            var itempost = await Optionproduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
//get data with url and link
optionproductController.getDataUrl = function(req, res){
    Optionproduct.aggregate([
        { "$project": {
            "id": "$_id",
            "value": "$slug",
            "label": "$name"
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
module.exports = optionproductController
