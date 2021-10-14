const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const StyleProduct = require("../../models/styleproduct");
const url = require('url');
const styleproductController = {}
styleproductController.list = function(req, res, next) {
    const filter = {};
    const query = url.parse(req.url,true).query;
    var perPage = query.perPage || 10
    var page = query.page || 1
    //===================end pagination
    //res.send(query);
    if(query){
        // NodeJs Mongoose find like Reference from
        // https://stackoverflow.com/questions/9824010/mongoose-js-find-user-by-username-like-value
        const keyword = new RegExp(query.keyword, 'i'); // it return /keyword/i            

        // NodeJs Mongoose query find OR Reference From
        // https://stackoverflow.com/questions/33898159/mongoose-where-query-with-or
        filter.$or = [{name: keyword}, {description:keyword}]
        //filter.page = page;
        StyleProduct.find(filter).populate('parent_id')
        .skip((perPage * page) - perPage)
        .limit(perPage).populate('imageNumber').exec((err, posts) => {
            StyleProduct.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        });
    }else{
        StyleProduct.populate('imageNumber').populate('parent_id').exec((err, post) => {
            res.send(post)
        });
    }
};
styleproductController.getAll = function(req, res, next) {
    StyleProduct.aggregate([
        { "$project": {
            "value": "$_id",
            "label": "$name",
            "alias": "$alias"
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
styleproductController.store = (req, res) => {
    var datas = {
        "name": req.body.name,
        "alias": slugify(req.body.name,'-'),
        "imagePath": req.body.imagePath,
        "imageNumber": req.body.imageNumber,
        "description": req.body.description,
        "parent_id": req.body.parent_id,
        "title_seo": req.body.title_seo,
        "description_seo": req.body.description_seo,
        "keyword_seo": req.body.keyword_seo,
    }
    //res.send({posts:datas});
    var post = new StyleProduct(datas);
        post.save(function(err, newPost){
            res.send(newPost)
        });
};
styleproductController.show = function(req, res) {
    const postId = req.params.id;
    StyleProduct.findById(postId).populate('imageNumber').populate('parent_id').exec(function (err, admins) {
      res.send(admins);
    });
}

styleproductController.update = function(req, res) {
    var data = {
        name: req.body.name,
        description: req.body.description,
        parent_id: req.body.parent_id,
        imageNumber: req.body.imageNumber,
        imagePath: req.body.imagePath,
        title_seo: req.body.title_seo,
        description_seo: req.body.description_seo,
        keyword_seo: req.body.keyword_seo,
    }
    StyleProduct.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            StyleProduct.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            });
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    })
}

styleproductController.delete = function(req, res) {
    StyleProduct.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa sản phẩm thành công!" })
    })
  }
styleproductController.remove = function(req, res){
    const request = req.body;
    StyleProduct.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    })
}
styleproductController.checkHome = async function(req, res){
    const itemstyleproduct = await StyleProduct.findOne({_id: req.body.id})
    if(req.body.type=="home"){
        if(itemstyleproduct.home==1){
            var data = await {home:0,checkHome:'false'}
            var itempost = await StyleProduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {home:1,checkHome:'true'}
            var itempost = await StyleProduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
styleproductController.checkFocus = async function(req, res){
    const itemstyleproduct = await StyleProduct.findOne({_id: req.body.id})
    if(req.body.type=="focus"){
        if(itemstyleproduct.focus==1){
            var data = await {focus:0,checkFocus:'false'}
            var itempost = await StyleProduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {focus:1,checkFocus:'true'}
            var itempost = await StyleProduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
//get data with url and link
styleproductController.getDataUrl = function(req, res){
    StyleProduct.aggregate([
        { "$project": {
            "id": "$_id",
            "value": "$slug",
            "label": "$name"
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
module.exports = styleproductController;