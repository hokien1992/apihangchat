var mongoose = require('mongoose')
var Schema = mongoose.Schema
var LocationSchema = new Schema({
    name: { type: String },
    level: { type: Number },
    alias: { type: String },
    parent_id: { type: String },
    lng: { type: Number },
    lat: { type: Number },
    COUNTRY_CODE: { type: String, default: '' },
    COUNTRY_NAME: { type: String, default: '' },
    COUNTRY_ID: { type: Number, default: 0 },
    PROVINCE_ID: { type: Number, default: 0 },
    PROVINCE_CODE: { type: String, default: '' },
    PROVINCE_NAME: { type: String, default: '' },
    DISTRICT_ID: { type: Number, default: 0 },
    DISTRICT_VALUE: { type: Number, default: 0 },
    DISTRICT_NAME: { type: String, default: '' },
    WARDS_ID: { type: Number, default: 0 },
    WARDS_NAME: { type: String, default: '' },
})
module.exports = mongoose.model('Location', LocationSchema);
