const express = require('express')
const fs = require('fs')
const rmfs = require('fs-extra')
const path = require('path')
const slugify = require('slugify')
slugify.extend({'đ': 'd'})
const Foldermedia = require("../../models/foldermedia")
const Gallery = require("../../models/gallery")
const url = require('url')
const foldermediaController = {}
foldermediaController.list = function(req, res, next) {
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
        filter.$or = [{name: keyword}]
        //filter.page = page;
        Foldermedia.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage).exec((err, posts) => {
            Foldermedia.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        })
    }else{
        Foldermedia.find({}).exec((err, post) => {
            res.send(post)
        })
    }
}

foldermediaController.getAll = async function(req, res, next) {
    const query = url.parse(req.url,true).query
    const filter = {
        parent_id: query.parentId
    }
    var dataParentNull = await Foldermedia.findOne(filter)
    if(dataParentNull){
        var data = await Foldermedia.find({parent_id: dataParentNull._id})
        var dataGallery = await Gallery.find({idFolder: dataParentNull._id})
        //var gallerys = Gallery.find({idFolder: dataParentNull._id})
        res.send({data:data, gallerys: dataGallery})
    }else{
        res.send({mes: "Chưa thể thêm thư mục",data:[]})
    }
    
}
foldermediaController.itemParentNull = async function(req, res, next) {
    const filter = {
        parent_id: "null"
    }
    const data = await Foldermedia.findOne(filter)
    res.send(data)
}
foldermediaController.show = async function(req, res) {
    const postId = req.params.id;
    let data = await Foldermedia.findById(postId)
    if(data.parent_id!="null"){
        let dataParent = await Foldermedia.findById(data.parent_id)
        var idParentFolder= dataParent._id
    }else{
        var idParentFolder = "null"
    }
    let gallerys = await Gallery.find({idFolder: postId})
    let datas = await Foldermedia.find({parent_id:postId})
    res.send({data: data, listData: datas, gallerys: gallerys, idParentFolder: idParentFolder})
};
//Add record
foldermediaController.store = function(req, res, next) {
    var dir = './public'+req.body.path+'/'+slugify(req.body.name,'')
    var path = req.body.path+'/'+slugify(req.body.name,'')
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir)
        var data = {
            name: slugify(req.body.name,''),
            parent_id: req.body.parent_id,
            path: req.body.path+'/'+slugify(req.body.name,''),
        }
        post = new Foldermedia(data)
        post.save( async function(err, result){
            var data = await Foldermedia.find({parent_id: result.parent_id})
            res.send({data: data})
        })
    }else
    {
        res.send({mes: "Directory already exist"})
    }
}
foldermediaController.update = (req, res) => {
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
    Foldermedia.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            Foldermedia.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            })
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"})
        }
    })
}
foldermediaController.remove = function(req, res){
    Foldermedia.findByIdAndRemove(req.params.id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            const folder = './public'+post.path
            rmfs.remove(folder, err => {
                res.send(err)
            })
            //res.send({post: post, message:'deleted'});
        }
    });
}
module.exports = foldermediaController