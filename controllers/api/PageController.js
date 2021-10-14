const express = require('express')
const slugify = require('slugify')
slugify.extend({'đ': 'd'})
const Page = require("../../models/page");
const Alias = require("../../models/alias");
const url = require('url');
const pageController = {}
pageController.list = function(req, res, next) {
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
        Page.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage).populate('imageNumber').exec((err, posts) => {
            Page.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        });
    }else{
        Page.populate('imageNumber').populate('parent_id').exec((err, post) => {
            res.send(post)
        });
    }
}
pageController.getAll = function(req, res, next) {
    Page.find({}).exec((err, post) => {
        res.send(post)
    })
}
pageController.store = async (req, res) => {
    var datas = {
        "name": req.body.name,
        "alias": slugify(req.body.name, {
                replacement: '-',    // replace spaces with replacement
                remove: null,        // regex to remove characters
                lower: true          // result in lower case
              }),
        "slug": slugify(req.body.name, {
                replacement: '-',    // replace spaces with replacement
                remove: null,        // regex to remove characters
                lower: true          // result in lower case
              }),
        "imagePath": req.body.imagePath,
        "imageNumber": req.body.imageNumber,
        "imageArray": req.body.imageArray,
        "description": req.body.description,
        "detail": req.body.detail,
        "title_seo": req.body.title_seo,
        "description_seo": req.body.description_seo,
        "keyword_seo": req.body.keyword_seo
    }
    if(req.body.imageNumber == ''){
      datas.imageNumber = null
    }
    var post = await new Page(datas)
    let datapost = await post.save()
    var paths = datapost.alias
    if(datapost){
        let data_alias = {
            "name": datapost.name,
            "title": datapost.name,
            "path": paths,
            "alias": datapost.alias,
            "slug": paths,
            "name_table": "Page",
            "id_table": datapost._id,
        }
        var postalias = await new Alias(data_alias)
        var datapostalias = await postalias.save()
    }
    res.send({paths:paths,datapostalias:datapostalias})
}
pageController.show = async function(req, res, next) {
    //res.send({test:'uhudhfudf'})
    var postId = req.params.id;
    var data = await Page.findById(postId).populate('imageNumber').populate('parent_id')
    res.send(data)
}

pageController.update = async function(req, res) {
    var data = {
        name: req.body.name,
        "alias": slugify(req.body.name, {
                replacement: '-',    // replace spaces with replacement
                remove: null,        // regex to remove characters
                lower: true          // result in lower case
              }),
        "slug": slugify(req.body.name, {
                replacement: '-',    // replace spaces with replacement
                remove: null,        // regex to remove characters
                lower: true          // result in lower case
              }),
        description: req.body.description,
        detail: req.body.detail,
        imageNumber: req.body.imageNumber,
        imagePath: req.body.imagePath,
        imageArray: req.body.imageArray,
        title_seo: req.body.title_seo,
        description_seo: req.body.description_seo,
        keyword_seo: req.body.keyword_seo,
    }

    Page.findOne({'_id': req.params.id}, async function(err, result){
      let data_alias = await {
            "name": data.name,
            "title": data.name,
            "alias": slugify(req.body.name, {
                    replacement: '-',    // replace spaces with replacement
                    remove: null,        // regex to remove characters
                    lower: true          // result in lower case
                  }),
            "slug": slugify(req.body.name, {
                    replacement: '-',    // replace spaces with replacement
                    remove: null,        // regex to remove characters
                    lower: true          // result in lower case
                  }),
            "path": slugify(req.body.name, {
                    replacement: '-',    // replace spaces with replacement
                    remove: null,        // regex to remove characters
                    lower: true          // result in lower case
                  }),
            "name_table": "Page",
            "id_table": result._id,
          }
        if(result){
            var dataItemAlias = await Alias.findOne({slug: result.slug})
            if(dataItemAlias){
                var datapostalias = await Alias.findByIdAndUpdate(dataItemAlias._id, { $set: data_alias}, { new: true })
            }else{
                var postalias = new Alias(data_alias)
                postalias.save(function(err, result) {
                    return result
                })
            }
            var datapost = await Page.findByIdAndUpdate(req.params.id, { $set: data}, { new: true })
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    })
}

pageController.delete = function(req, res) {
    Page.remove({_id: req.params.id}, function(err) {
        res.json({ "message": "Xóa sản phẩm thành công!" })
    })
}
pageController.remove = function(req, res){
    const request = req.body;
    Page.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}

pageController.checkHome = async function(req, res){
    const itemstyleproduct = await Page.findOne({_id: req.body.id})
    if(req.body.type=="home"){
        if(itemstyleproduct.home==1){
            var data = await {home:0}
            var itempost = await Page.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {home:1}
            var itempost = await Page.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
pageController.checkFocus = async function(req, res){
    const itemstyleproduct = await Page.findOne({_id: req.body.id})
    if(req.body.type=="focus"){
        if(itemstyleproduct.focus==1){
            var data = await {focus:0}
            var itempost = await Page.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {focus:1}
            var itempost = await Page.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
//get data with url and link
pageController.getDataUrl = function(req, res){
    Page.aggregate([
        { "$project": {
            "id": "$_id",
            "value": "$slug",
            "label": "$name"
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
module.exports = pageController;
