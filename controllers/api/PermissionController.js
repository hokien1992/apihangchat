const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const Permission = require("../../models/permission");
const url = require('url');
const permissionController = {};
permissionController.list = function(req, res, next) {
    //res.send(req);
    const filter = {};
    const query = url.parse(req.url,true).query;
    //===================paginattion
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
        Permission.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage).exec((err, posts) => {
            Permission.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        });
    }else{
        Permission.find({}).exec((err, post) => {
            res.send(post)
        });
    }
};
permissionController.getAll = function(req, res, next) {
    const filter = {};
    const query = url.parse(req.url,true).query;
    if(query.author){
        filter.author = query.author;
    }
    Permission.find(filter).populate('author').populate('tags').exec((err, post) => {
        res.send(post)
    });
};
permissionController.show = function(req, res) {
    const postId = req.params.id;
    Permission.findById(postId).populate('author').populate('tags').populate('imageNumber').populate({path:'comments.author', select:'email'}).exec(function (err, admins) {
      res.send(admins);
    });
};
//Add record
permissionController.store = function(req, res) {
    //res.send(req);
    var datas = {
        "name": req.body.name,
        "keyname": req.body.keyname,
        "path": req.body.path,
        "description": req.body.description,
        "parent_id": req.body.parent_id,
    };
    var post = new Permission(datas);
        post.save(function(err, newPost){
            res.send(newPost)
        });
};
permissionController.update = (req, res) => {
    var data = {
        "name": req.body.name,
        "keyname": req.body.keyname,
        "path": req.body.path,
        "description": req.body.description,
        "parent_id": req.body.parent_id,
    }
    Permission.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            Permission.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            });
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    });
}

permissionController.delete = function(req, res) {
    Permission.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa sản phẩm thành công!" })
    });
};
permissionController.remove = function(req, res){
    const request = req.body;
    Permission.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
module.exports = permissionController;