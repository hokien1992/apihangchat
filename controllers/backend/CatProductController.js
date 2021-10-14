const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const CatProduct = require("../../models/catproduct");
const url = require('url');
const catproductController = {};
catproductController.list = function(req, res, next) {
    CatProduct.find().populate('imageNumber').exec((err, posts) => {
        res.render('backend/catproduct/index', { results: posts, layout: 'layouts/backend/home' });
    });
};
catproductController.getAll = function(req, res, next) {
    const filter = {};
    const query = url.parse(req.url,true).query;
    if(query.author){
        filter.author = query.author;
    }
    CatProduct.find(filter).populate('author').populate('tags').exec((err, post) => {
        res.send(post)
    });
};
catproductController.create = function(req, res) {
    const results = {};
    res.render('backend/catproduct/create', { results: results, csrfToken: req.csrfToken(), layout: 'layouts/backend/home', user: req.user});
};
catproductController.show = function(req, res) {
    var postId = req.params.id;
    CatProduct.findOne({_id: req.params.id}).populate('author').populate('tags').populate('imageNumber').populate({path:'comments.author', select:'email'}).exec(function (err, results) {
      if (err) {
        res.redirect("/catproduct/show/"+res._id);
      }
      else {
        res.render('backend/catproduct/show', { results: results, csrfToken: req.csrfToken(), layout: 'layouts/backend/home', user: req.user});
      }
    });
};
//Add record
catproductController.store = function(req, res) {
    //res.send(req);
    var datas = {
        name: req.body.name,
        alias: slugify(req.body.name,'-'),
        imagePath: req.body.imagePath,
        parent_id: req.body.parent_id,
        description: req.body.description,
        title_seo: req.body.title_seo,
        description_seo: req.body.description_seo,
        keyword_seo: req.body.keyword_seo,
    };
    var post = new CatProduct(datas);
        post.save(function(err, newPost){
            res.send(newPost)
        });
};
catproductController.update = function(req, res) {
    var messenger = {};
    var data = {
        name: req.body.name,
        description: req.body.description,
    }
    CatProduct.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            CatProduct.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            });
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    });
};

catproductController.delete = function(req, res) {
    CatProduct.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa sản phẩm thành công!" })
    });
};
catproductController.remove = function(req, res){
    const request = req.body;
    CatProduct.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
module.exports = catproductController;