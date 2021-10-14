var express = require('express')
var bcrypt = require('bcryptjs')
var dateTime = require('node-datetime')
//Chèn models
var Location = require('../../models/location')
var locationController = {}
var router = express.Router()
const url = require('url')
locationController.sLocation = async function(req,res,next) {

    const query = url.parse(req.url,true).query
    //var dataChildren = await Location.find({parent_id: query.parent})
    //res.send(parseInt(query.parent))
    var dataChildren = await Location.aggregate([
      { $match : { PROVINCE_CODE : { $exists: false }, PROVINCE_ID : parseInt(query.parent) } },
      { $project: {
            "_id": "$_id",
            "district_name": "$DISTRICT_NAME",
            "district_code": "$DISTRICT_CODE",
            "district_id": "$DISTRICT_ID",
        }
      },
      { $sort: { DISTRICT_ID: -1 } }
    ])
    //console.log(dataChildren)
    res.send(dataChildren)
}
module.exports = locationController
