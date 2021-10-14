const express = require('express');
const slugify = require('slugify');
slugify.extend({'đ': 'd'})
const Alias = require("../../models/alias");
const url = require('url');
const aliasController = {}
aliasController.getAll = function(req, res, next) {
    Alias.find({}).exec((err, post) => {
        res.send(post)
    });
}
aliasController.list = function(req, res, next) {
    Alias.find({}).exec((err, post) => {
        res.send(post)
    });
}
aliasController.remove = function(req, res){
    const request = req.body;
    Alias.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
module.exports = aliasController;