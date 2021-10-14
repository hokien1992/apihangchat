const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const CatProduct = require("../../models/catproduct");
const Alias = require("../../models/alias");
const url = require('url');
const catproductController = {}
catproductController.getAllProject = function(req, res, next){
    CatProduct.aggregate([
        { "$project": {
                "value": "$_id",
                "label": "$name",
            }}
    ], function (err, tags) {
        res.send(tags)
    });
}
catproductController.list = function(req, res, next) {
    const filter = {};
    const query = url.parse(req.url,true).query;
    var perPage = query.perPage || 10
    var page = query.page || 1
    //===================end pagination
    //res.send(query);
    if(query){
        const keyword = new RegExp(query.keyword, 'i');
        filter.$or = [{name: keyword}, {description:keyword}]
        //filter.page = page;
        CatProduct.find(filter).populate('parent_id')
            .skip((perPage * page) - perPage)
            .limit(perPage).populate('imageNumber').exec((err, posts) => {
            CatProduct.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        });
    }else{
        CatProduct.populate('imageNumber').populate('parent_id').exec((err, post) => {
            res.send(post)
        });
    }
}
catproductController.limitCatproduct = function(req, res, next) {
    CatProduct.aggregate([
        { "$project": {
                "value": "$_id",
                "label": "$breakcrum_name",
                "alias": "$slug"
            }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
catproductController.getAll = function(req, res, next) {
    CatProduct.find({}).exec((err, post) => {
        res.send(post)
    })
}
catproductController.store = async (req, res) => {
    var datas = await {
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
        "iconPath": req.body.iconPath,
        "iconNumber": req.body.iconNumber,
        "imagePath": req.body.imagePath,
        "imageNumber": req.body.imageNumber,
        "imageArray": req.body.imageArray,
        "description": req.body.description,
        "parent_id": req.body.parent_id,
        "title_seo": req.body.title_seo,
        "description_seo": req.body.description_seo,
        "keyword_seo": req.body.keyword_seo
    }
    var post = await new CatProduct(datas)
    let datapost = await post.save()

    if(datapost.parent_id!=null){
        // Breakcrum alias
        var paths = await postdataparentid(datapost,datapost._id)+'/'+datapost.alias
        // Breakcrum name
        var breakcrum_name = await postdataparentname(datapost,datapost._id)+' > '+datapost.name
        var dataposts = await CatProduct.findByIdAndUpdate(datapost._id, { $set: {slug:paths,breakcrum_name:breakcrum_name}}, { new: true })
    }else{
        var paths = await datapost.alias
        var breakcrum_name = await datapost.name
        var dataposts = await CatProduct.findByIdAndUpdate(datapost._id, { $set: {slug:paths,breakcrum_name:breakcrum_name}}, { new: true })
    }

    if(datapost){
        let data_alias = await {
            "name": datapost.name,
            "title": datapost.name,
            "path": paths,
            "alias": datapost.alias,
            "slug": paths,
            "name_table": "catproduct",
            "id_table": datapost._id,
        }
        var postalias = await new Alias(data_alias)
        var datapostalias = await postalias.save()
    }
    if(datapost.parent_id!=null){
        var idCd = await datapost._id;
        let dataitem = await CatProduct.findOne({'_id': datapost.parent_id})
        if(dataitem){
            var datas1 = {}
            datas1.childs = await dataitem.childs
            datas1.childs[dataitem.childs.length] = await idCd;
            var datapost1 = await CatProduct.findByIdAndUpdate(dataitem._id, { $set: datas1}, { new: true })

        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    }else{
        //res.send(datapost)
    }
    res.send({paths:paths,datapostalias:datapostalias})
}
// Breakcrum alias
async function postdataparentid(data_category,id){
    let ids = id
    let data_categorys = await CatProduct.findById(data_category.parent_id)
    if(data_categorys.parent_id!=null){
        return await postdataparentid(data_categorys,'00')+'/'+data_categorys.alias
    }else{
        return await data_categorys.alias
    }
}
// Breackcrum name
async function postdataparentname(data_category,id){
    let ids = id
    let data_categorys = await CatProduct.findById(data_category.parent_id)
    if(data_categorys.parent_id!=null){
        return await postdataparentname(data_categorys,'00')+' > '+data_categorys.name
    }else{
        return await data_categorys.name
    }

}
catproductController.show = async function(req, res, next) {
    //res.send({test:'uhudhfudf'})
    var postId = req.params.id;
    var data = await CatProduct.findById(postId).populate('imageNumber').populate('parent_id')
    res.send(data)
}

catproductController.update = function(req, res) {
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
        parent_id: req.body.parent_id,
        iconPath: req.body.iconPath,
        iconNumber: req.body.iconNumber,
        imageNumber: req.body.imageNumber,
        imagePath: req.body.imagePath,
        imageArray: req.body.imageArray,
        title_seo: req.body.title_seo,
        description_seo: req.body.description_seo,
        keyword_seo: req.body.keyword_seo,
    }
    if(req.body.iconNumber==""){
        data.iconNumber=null
    }
    if(req.body.imageNumber==""){
        data.imageNumber=null
    }
    CatProduct.findOne({'_id': req.params.id}, async function(err, result){
        if(result){
            var datapost = await CatProduct.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, datapost) {
                return datapost
            })
            var item_alias_old = await Alias.findOne({
                slug: result.slug,
                id_table: result._id,
                name_table: 'catproduct'
            })
            if(datapost.parent_id!=null){
                // Breakcrum alias
                var paths = await postdataparentid(datapost,datapost._id)+'/'+datapost.alias
                // Breakcrum name
                var breakcrum_name = await postdataparentname(datapost,datapost._id)+' > '+datapost.name
                var dataposts = await CatProduct.findByIdAndUpdate(datapost._id, { $set: {slug:paths,breakcrum_name:breakcrum_name}}, { new: true }, function(result){
                    return result
                })
            }else{
                var paths = await datapost.alias
                var breakcrum_name = await datapost.name
                var dataposts = await CatProduct.findByIdAndUpdate(datapost._id, { $set: {slug:paths,breakcrum_name:breakcrum_name}}, { new: true }, function(result){
                    return result
                })
            }
            if(datapost){
                let data_alias = await {
                    "name": datapost.name,
                    "title": datapost.name,
                    "path": paths,
                    "alias": datapost.alias,
                    "slug": paths,
                    "name_table": "catproduct",
                    "id_table": datapost._id,
                }
                //var dataItemAlias = await Alias.findOne({slug:paths})
                if(item_alias_old){
                    var updateAlias = await Alias.findByIdAndUpdate(item_alias_old._id, { $set: data_alias}, { new: true }, function(result){
                        return result
                    })
                    res.send(updateAlias)
                }else{
                    var postalias = await new Alias(data_alias)
                    var datapostalias = await postalias.save()
                    res.send(datapostalias)
                }
            }
            //res.send(datapost)
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    });
}

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
catproductController.checkHome = async function(req, res){
    const itemstyleproduct = await CatProduct.findOne({_id: req.body.id})
    if(req.body.type=="home"){
        if(itemstyleproduct.home==1){
            var data = await {home:0,checkHome:'false'}
            var itempost = await CatProduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {home:1,checkHome:'true'}
            var itempost = await CatProduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
catproductController.checkFocus = async function(req, res){
    const itemstyleproduct = await CatProduct.findOne({_id: req.body.id})
    if(req.body.type=="focus"){
        if(itemstyleproduct.focus==1){
            var data = await {focus:0,checkFocus:'false'}
            var itempost = await CatProduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {focus:1,checkFocus:'true'}
            var itempost = await CatProduct.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
//get data with url and link
catproductController.getDataUrl = function(req, res){
    CatProduct.aggregate([
        { "$project": {
                "id": "$_id",
                "value": "$slug",
                "label": "$name"
            }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
module.exports = catproductController;
