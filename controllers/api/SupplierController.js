const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const Supplier = require("../../models/supplier");
const url = require('url');
const supplierController = {};
supplierController.list = function(req, res, next) {
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
        Supplier.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage).populate('imageNumber').sort({_id: -1}).exec((err, posts) => {
            Supplier.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        });
    }else{
        Supplier.find({}).exec((err, post) => {
            res.send(post)
        });
    }
};
supplierController.getAll = function(req, res, next) {
    const filter = {};
    Supplier.aggregate([
        { "$project": {
            "value": "$_id",
            "label": "$name",
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
};
supplierController.show = function(req, res) {
    const postId = req.params.id;
    Supplier.findById(postId).populate('author').populate('tags').populate('imageNumber').populate({path:'comments.author', select:'email'}).exec(function (err, admins) {
      res.send(admins);
    });
};
//Add record
supplierController.store = function(req, res) {
    //res.send(req);
    var datas = {
        "name": req.body.name,
        "phone": req.body.phone,
        "email": req.body.email,
        "facebook": req.body.facebook,
        "zalo": req.body.zalo,
        "country": req.body.country,
        "province": req.body.province,
        "district": req.body.district,
        "wards": req.body.wards,
        "address": req.body.address,
        "alias": slugify(req.body.name,'-'),
        "imagePath": req.body.imagePath,
        "imageNumber": req.body.imageNumber,
        "description": req.body.description,
        "parent_id": req.body.parent_id,
        "title_seo": req.body.title_seo,
        "keyword_seo": req.body.keyword_seo,
        "description_seo": req.body.description_seo,
    };
    var post = new Supplier(datas);
        post.save(function(err, newPost){
            res.send(newPost)
        });
};
supplierController.update = (req, res) => {
    var data = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        facebook: req.body.facebook,
        zalo: req.body.zalo,
        country: req.body.country,
        province: req.body.province,
        district: req.body.district,
        wards: req.body.wards,
        address: req.body.address,
        description: req.body.description,
        parent_id: req.body.parent_id,
        imageNumber: req.body.imageNumber,
        imagePath: req.body.imagePath,
        title_seo: req.body.title_seo,
        description_seo: req.body.description_seo,
        keyword_seo: req.body.keyword_seo,
    }
    Supplier.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            Supplier.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            });
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    });
}

supplierController.delete = function(req, res) {
    Supplier.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa sản phẩm thành công!" })
    });
  };
supplierController.remove = function(req, res){
    const request = req.body;
    Supplier.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
//get data with url and link
supplierController.getDataUrl = function(req, res){
    Supplier.aggregate([
        { "$project": {
            "id": "$_id",
            "value": "$slug",
            "label": "$name"
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
supplierController.checkHome = async function(req, res){
    const itemstyleproduct = await Supplier.findOne({_id: req.body.id})
    if(req.body.type=="active"){
        if(itemstyleproduct.active==1){
            var data = {active:0}
            var itempost = await Supplier.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = {active:1}
            var itempost = await Supplier.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
module.exports = supplierController;
