var express = require('express')
var Tag = require("../../models/tag")
var tagController = {}
tagController.getAll = function(req, res, next){
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
tagController.list = async function(req, res, next) {
    let data = await Tag.find({})
    res.send(data)
}
tagController.remove = function(req, res){
    const request = req.body;
    Tag.findByIdAndRemove(request._id, (err, post) => {
        if(err){
            res.send(err);
        }else{
            res.send({post: post, message:'deleted'});
        }
    });
}
module.exports = tagController;
