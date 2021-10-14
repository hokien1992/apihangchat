const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const Stylegallery = require("../../models/stylegallery");
const url = require('url');
const stylegalleryController = {};
stylegalleryController.list = function(req, res, next) {
    //res.send(req);
    const filter = {};
    const query = url.parse(req.url,true).query;
    //===================paginattion
    var perPage = query.perPage || 10
    var page = query.page || 1
    //===================end pagination
    if(query){
        // NodeJs Mongoose find like Reference from
        // https://stackoverflow.com/questions/9824010/mongoose-js-find-user-by-username-like-value
        const keyword = new RegExp(query.keyword, 'i'); // it return /keyword/i            

        // NodeJs Mongoose query find OR Reference From
        // https://stackoverflow.com/questions/33898159/mongoose-where-query-with-or
        filter.$or = [{name: keyword}, {description:keyword}]
        //filter.page = page;
        Stylegallery.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage).exec((err, posts) => {
            Stylegallery.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        });
    }else{
        Stylegallery.find({}).exec((err, post) => {
            res.send(post)
        });
    }
};
stylegalleryController.getAll = function(req, res, next) {
    const filter = {};
    const query = url.parse(req.url,true).query;
    if(query.author){
        filter.author = query.author;
    }
    Stylegallery.find(filter).exec((err, post) => {
        res.send(post)
    });
};
stylegalleryController.show = function(req, res) {
    const postId = req.params.id;
    Stylegallery.findById(postId).exec(function (err, admins) {
      res.send(admins);
    });
};
//Add record
stylegalleryController.store = function(req, res) {
    var datas = {
        "title": req.body.name,
        "name": req.body.name,
        "description": req.body.description,
        "keyname": req.body.keyname
    };
    var post = new Stylegallery(datas);
        post.save(function(err, newPost){
            res.send(newPost)
        });
};
stylegalleryController.update = (req, res) => {
    var data = {
        "title": req.body.name,
        "name": req.body.name,
        "description": req.body.description,
        "keyname": req.body.keyname,
    }
    Stylegallery.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            Stylegallery.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            });
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    });
}

stylegalleryController.delete = function(req, res) {
    Stylegallery.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa sản phẩm thành công!" })
    });
};
stylegalleryController.remove = function(req, res){
    const request = req.body;
    Stylegallery.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
module.exports = stylegalleryController;