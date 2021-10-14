const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const Product = require("../../models/product");
const Tag = require("../../models/tag");
const url = require('url');
const productController = {};
productController.list = function(req, res, next) {
    Product.find()
    .populate('author').populate('tags').populate('imageNumber').exec((err, posts) => {
        res.render('backend/product/index', { results: posts, layout: 'layouts/backend/home' });
    });
};
productController.getAll = function(req, res, next) {
    const filter = {};
    const query = url.parse(req.url,true).query;
    if(query.author){
        filter.author = query.author;
    }
    Product.find(filter).populate('author').populate('tags').exec((err, post) => {
        res.send(post)
    });
};
productController.create = (req, res) => {
    const results = {};
    res.render('backend/product/create', { results: results, csrfToken: req.csrfToken(), layout: 'layouts/backend/home', user: req.user});
}
productController.show = function(req, res) {
    var postId = req.params.id;
    Product.findOne({_id: req.params.id}).populate('author').populate('tags').populate('imageNumber').populate({path:'comments.author', select:'email'}).exec(function (err, results) {
      if (err) {
        res.redirect("/product/show/"+res._id);
      }
      else {
        res.render('backend/product/show', { results: results, csrfToken: req.csrfToken(), layout: 'layouts/backend/home', user: req.user});
      }
    });
}

productController.store = (req, res) => {
    var datas = {
        name: req.body.name,
        alias: slugify(req.body.name,'-'),
        imagePath: req.body.imagePath,
        imageNumber: req.body.imageNumber,
        description: req.body.description,
        detail: req.body.detail,
        price: req.body.price,
        category_id: req.body.category_id,
        title_seo: req.body.title_seo,
        description_seo: req.body.description_seo,
        keyword_seo: req.body.keyword_seo
    };
    var post = new Product(datas);
        post.save(function(err, results){
            res.redirect('/backend/product/show/'+results._id)
        });
}
productController.edit = function(req, res) {

};

productController.update = function(req, res) {
    var messenger = {};
    var datas = {
        name: req.body.name,
        imagePath: req.body.imagePath,
        imageNumber: req.body.imageNumber,
        description: req.body.description,
        detail: req.body.detail,
        price: req.body.price,
        price_old: req.body.price_old,
        category_id: req.body.category_id,
        title_seo: req.body.title_seo,
        description_seo: req.body.description_seo,
        keyword_seo: req.body.keyword_seo
    };
    Product.findOne({'_id': req.params.id}, function(err, result){
        if(result && result._id!=req.params.id){
            res.send({"error":0});
        }else{
            Product.findByIdAndUpdate(req.params.id, { $set: datas}, { new: true }, function (err, results) {
                res.redirect('/backend/product/show/'+req.params.id);
            })
        }
    });
}
productController.delete = function(req, res) {
    Product.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa sản phẩm thành công!" })
    });
  };
productController.saveProductAndTag = function(req, res){
    // first save tag
    const request = req.body;
    const tags = request.tags.map(function(item, index){
        return { label : item };  // this is loop and prepare tags array to save,
    })
    res.send(tags);
    Tag.insertMany(tags, {ordered:false}, function(err, savedtags){
        if(err){
            if(err.code=="11000"){  // 11000 is duplicate error code
                Tag.find({ "label": { "$in" : request.tags }}).then(function(data){
                    const post = new Product(request);
                    post.tags = data.map(function(item, index){
                        return item._id
                    })
                    post.save((err, savedpost) => {
                        if(err){
                            res.send(err);
                        }else{
                            res.send({post: savedpost, tags:data});
                        }
                    })
                })
            }else{
                res.send(err);
            }
        }else{
            const product = new Product(request);
            product.tags = savedtags.map(function(item, index){
                return item._id
            })
            product.save((err, savedpost) => {
                if(err){
                    res.send(err);
                }else{
                    res.send({post: savedpost, tags:savedtags});
                }
            })
        }
    })
}
productController.getAlltags = function(req, res, next){
    Tag.aggregate([
        { "$project": {
            "value": "$_id",
            "label": "$label",
        }}
    ], function (err, tags) {
        if (err)
            res.send(err)
        else if (!tags)
            res.send(404)
        else
            res.send(tags)
    });
}
productController.saveProductAndTagAsync = async function(req, res, next){
    const request = req.body;
		let returnres;
		if(request._id){
			const post = await Product.findById(request._id);
			returnres = await post.savePostTags(request);
		}else{
			const post = new Product();
			returnres = await post.savePostTags(request);
		}
		res.send(returnres);
}
productController.remove = function(req, res){
    const request = req.body;
    Product.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
module.exports = productController;
