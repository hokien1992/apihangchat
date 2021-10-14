const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const Catnew = require("../../models/catnew");
const Alias = require("../../models/alias");
const url = require('url');
const catnewController = {}
catnewController.list = function(req, res, next) {
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
        Catnew.find(filter).populate('parent_id')
            .skip((perPage * page) - perPage)
            .limit(perPage).populate('imageNumber').exec((err, posts) => {
            Catnew.find(filter).countDocuments().exec(function(err, count) {
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        });
    }else{
        Catnew.populate('imageNumber').populate('parent_id').exec((err, post) => {
            res.send(post)
        });
    }
}
catnewController.limitCatnew = function(req, res, next) {
    Catnew.aggregate([
        { "$project": {
                "value": "$_id",
                "label": "$breakcrum_name",
                "alias": "$slug"
            }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
catnewController.getAll = function(req, res, next) {
    Catnew.find({}).exec((err, post) => {
        res.send(post)
    });
}
catnewController.store = async (req, res) => {
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
        "imagePath": req.body.imagePath,
        "imageNumber": req.body.imageNumber,
        "imageArray": req.body.imageArray,
        "description": req.body.description,
        "parent_id": req.body.parent_id,
        "title_seo": req.body.title_seo,
        "description_seo": req.body.description_seo,
        "keyword_seo": req.body.keyword_seo
    }
    var post = await new Catnew(datas)
    let datapost = await post.save()

    if(datapost.parent_id!=null){
        // Breakcrum alias
        var paths = await postdataparentid(datapost,datapost._id)+'/'+datapost.alias
        // Breakcrum name
        var breakcrum_name = await postdataparentname(datapost,datapost._id)+' > '+datapost.name
        var dataposts = await Catnew.findByIdAndUpdate(datapost._id, { $set: {slug:paths,breakcrum_name:breakcrum_name}}, { new: true })
    }else{
        var paths = await datapost.alias
        var breakcrum_name = await datapost.name
        var dataposts = await Catnew.findByIdAndUpdate(datapost._id, { $set: {slug:paths,breakcrum_name:breakcrum_name}}, { new: true })
    }

    if(datapost){
        let data_alias = await {
            "name": datapost.name,
            "title": datapost.name,
            "path": paths,
            "alias": datapost.alias,
            "slug": paths,
            "name_table": "Catnew",
            "id_table": datapost._id,
        }
        var postalias = await new Alias(data_alias)
        var datapostalias = await postalias.save()
    }
    if(datapost.parent_id!=null){
        var idCd = await datapost._id;
        let dataitem = await Catnew.findOne({'_id': datapost.parent_id})
        if(dataitem){
            var datas1 = {};
            datas1.childs = await dataitem.childs
            datas1.childs[dataitem.childs.length] = await idCd;
            var datapost1 = await Catnew.findByIdAndUpdate(dataitem._id, { $set: datas1}, { new: true })

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
    let data_categorys = await Catnew.findById(data_category.parent_id)
    if(data_categorys.parent_id!=null){
        return await postdataparentid(data_categorys,'00')+'/'+data_categorys.alias
    }else{
        return await data_categorys.alias
    }
}
// Breackcrum name
async function postdataparentname(data_category,id){
    let ids = id
    let data_categorys = await Catnew.findById(data_category.parent_id)
    if(data_categorys.parent_id!=null){
        return await postdataparentname(data_categorys,'00')+' > '+data_categorys.name
    }else{
        return await data_categorys.name
    }

}
catnewController.show = async function(req, res, next) {
    //res.send({test:'uhudhfudf'})
    var postId = req.params.id;
    var data = await Catnew.findById(postId).populate('imageNumber').populate('parent_id')
    res.send(data)
}

catnewController.update = function(req, res) {
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
        imageNumber: req.body.imageNumber,
        imagePath: req.body.imagePath,
        imageArray: req.body.imageArray,
        title_seo: req.body.title_seo,
        description_seo: req.body.description_seo,
        keyword_seo: req.body.keyword_seo,
    }
    Catnew.findOne({'_id': req.params.id}, async function(err, result){
        if(result){
            var datapost = await Catnew.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, datapost) {
                return datapost
            })
            var item_alias_old = await Alias.findOne({
                slug: result.slug,
                id_table: result._id,
                name_table: 'catnew'
            })
            if(datapost.parent_id!=null){
                // Breakcrum alias
                var paths = await postdataparentid(datapost,datapost._id)+'/'+data.alias
                // Breakcrum name
                var breakcrum_name = await postdataparentname(datapost,datapost._id)+' > '+datapost.name
                var dataposts = await Catnew.findByIdAndUpdate(datapost._id, { $set: {slug:paths,breakcrum_name:breakcrum_name}}, { new: true }, function(result){
                    return result
                })
            }else{
                var paths = await data.alias
                var breakcrum_name = await datapost.name
                var dataposts = await Catnew.findByIdAndUpdate(datapost._id, { $set: {slug:paths,breakcrum_name:breakcrum_name}}, { new: true }, function(result){
                    return result
                })
            }
            if(datapost){
                let data_alias = {
                    "name": datapost.name,
                    "title": datapost.name,
                    "path": paths,
                    "alias": data.alias,
                    "slug": paths,
                    "name_table": "catnew",
                    "id_table": datapost._id,
                }
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
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"});
        }
    });
}

catnewController.delete = function(req, res) {
    Catnew.remove({_id: req.params.id}, function(err) {
        res.json({ "message": "Xóa sản phẩm thành công!" })
    })
}
catnewController.remove = function(req, res){
    Catnew.findByIdAndRemove(req.params.id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    })
}
catnewController.checkHome = async function(req, res){
    const itemstyleproduct = await Catnew.findOne({_id: req.body.id})
    if(req.body.type=="home"){
        if(itemstyleproduct.home==1){
            var data = await {home:0,checkHome:'false'}
            var itempost = await Catnew.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {home:1,checkHome:'true'}
            var itempost = await Catnew.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
catnewController.checkFocus = async function(req, res){
    const itemstyleproduct = await Catnew.findOne({_id: req.body.id})
    if(req.body.type=="focus"){
        if(itemstyleproduct.focus==1){
            var data = await {focus:0,checkFocus:'false'}
            var itempost = await Catnew.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {focus:1,checkFocus:'true'}
            var itempost = await Catnew.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
//get data with url and link
catnewController.getDataUrl = function(req, res){
    Catnew.aggregate([
        { "$project": {
                "id": "$_id",
                "value": "$slug",
                "label": "$name"
            }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
module.exports = catnewController;
