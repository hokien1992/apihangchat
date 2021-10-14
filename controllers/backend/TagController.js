var express = require('express');
var Tag = require("../../models/tag");
var tagController = {};
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
module.exports = tagController;