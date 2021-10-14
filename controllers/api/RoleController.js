const express = require('express')
const slugify = require('slugify')
slugify.extend({'đ': 'd'})
const Role = require("../../models/role")
const Admin = require("../../models/admin")
const url = require('url')
const roleController = {}
roleController.list = function(req, res, next) {
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
        Role.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage).exec((err, posts) => {
            Role.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        });
    }else{
        Role.find({}).exec((err, post) => {
            res.send(post)
        });
    }
};
roleController.getAlls = function(req, res, next) {
    const filter = {};
    const query = url.parse(req.url,true).query;
    if(query.author){
        filter.author = query.author;
    }
    Role.find(filter).populate({path:'permission.data', select:'*'}).exec((err, post) => {
        res.send(post)
    })
}
roleController.getAll = function(req, res, next) {
    Role.find({}).exec((err, post) => {
        res.send(post)
    })
}
roleController.show = function(req, res) {
    const postId = req.params.id;
    Role.findById(postId).populate({path:'permission.data', select:'*'}).exec(function (err, admins) {
      res.send(admins)
    })
}
//Add record
roleController.store = function(req, res) {
    //res.send(req);
    var datas = {
        name: req.body.name,
        description: req.body.description,
        arrayPermission: req.body.arrayPermission
    };
    var post = new Role(datas);
        post.save(function(err, newPost){
            res.send(newPost)
        })
}
roleController.update = async (req, res) => {
    var data = {
        "name": req.body.name,
        "description": req.body.description,
        arrayPermission: req.body.arrayPermission
    }
    var dataA = {
        arrayPermission: req.body.arrayPermission
    }
    var findRole = await Role.findOne({'_id': req.params.id})
    if(findRole){
        var data = await Role.findByIdAndUpdate(req.params.id, { $set: data}, { new: true })
        var dataAdmin = await Admin.find({role_id:findRole._id})
        for(i=0;i<dataAdmin.length;i++){
            var post = await Admin.findByIdAndUpdate(dataAdmin[i]._id, { $set: dataA}, { new: true })
        }
        res.send(findRole)
    }else{
        res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"})
    }
}

roleController.delete = function(req, res) {
    Role.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa sản phẩm thành công!" })
    })
}
roleController.remove = function(req, res){
    const request = req.body;
    Role.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
module.exports = roleController;