const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const Photo = require("../../models/photo");
const url = require('url');
const photoController = {};
photoController.list = function(req, res, next) {
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
        Photo.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage).exec((err, posts) => {
            Photo.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        })
    }else{
        Photo.find({}).exec((err, post) => {
            res.send(post)
        })
    }
}
photoController.getAll = function(req, res, next) {
    const filter = {};
    const query = url.parse(req.url,true).query;
    if(query.author){
        filter.author = query.author;
    }
    Photo.find(filter).exec((err, post) => {
        res.send(post)
    })
}
photoController.show = function(req, res) {
    const postId = req.params.id;
    Photo.findById(postId).exec(function (err, admins) {
      res.send(admins);
    })
};
//Add record
photoController.store = function(req, res) {
    var datas = {
        "title": req.body.name,
        "name": req.body.name,
        "style_id": req.body.style_id,
        "description": req.body.description,
        "keyname": req.body.keyname,
        "link": req.body.link,
        "imageNumber": req.body.imageNumber,
        "imagePath": req.body.imagePath,
    }
    var post = new Photo(datas)
        post.save(function(err, newPost){
            res.send(newPost)
        })
}
photoController.update = (req, res) => {
    var data = {
        "title": req.body.name,
        "style_id": req.body.style_id,
        "name": req.body.name,
        "description": req.body.description,
        "keyname": req.body.keyname,
        "link": req.body.link,
        "imageNumber": req.body.imageNumber,
        "imagePath": req.body.imagePath,
    }
    Photo.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            Photo.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            })
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    })
}

photoController.delete = function(req, res) {
    Photo.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa sản phẩm thành công!" })
    })
}
photoController.remove = function(req, res){
    const request = req.body;
    Photo.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err)
        }else{
            res.send({post: post, message:'deleted'})
        }
    });
}
module.exports = photoController