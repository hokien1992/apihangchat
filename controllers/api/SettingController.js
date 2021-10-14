const express = require('express');
const Setting = require("../../models/setting");
const url = require('url');
const settingController = {};
settingController.show = function(req, res) {
    const postlang = req.params.lang;
    Setting.findOne({'lang': "index"}).populate('logo').populate('favicon').exec( function(err, result){
        if(err){
            res.send(err);
        }
        if(result){
            res.send(result);
        }
    })
};
settingController.update = function(req, res) {
    var data = {
        name: req.body.name,
        slogan: req.body.slogan,
        website: req.body.website,
        address: req.body.address,
        logo: req.body.logo,
        favicon: req.body.favicon,
        phone: req.body.phone,
        hotline: req.body.hotline,
        facebook: req.body.facebook,
        lang: req.body.lang,
        zalo: req.body.zalo,
        linken: req.body.linken,
        email: req.body.email,
        glus: req.body.glus,
        title_seo: req.body.title_seo,
        keyword_seo: req.body.keyword_seo,
        description_seo: req.body.description_seo,
    }
    Setting.findOne({'lang': "index"}, function(err, result){
        //res.send(req.params.lang);
        if(result){
            Setting.findByIdAndUpdate(result._id, { $set: data}, { new: true }, function (err, results) {
                if(err){
                    res.send({massage: 'Lôi update'});
                }
                if(results){
                    res.send(results);
                }
            });
        }else{
            var post = new Setting(data);
            post.save(function(err, results){
                res.send(results)
            });
        }
    });
};

settingController.delete = function(req, res) {
    Setting.remove({_id: req.params.id}, function(err) {
        res.json({ "message": "Xóa sản phẩm thành công!" })
    });
};
settingController.remove = function(req, res){
    const request = req.body;
    Setting.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
module.exports = settingController;
