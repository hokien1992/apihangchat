var mongoose = require('mongoose')
var Schema = mongoose.Schema
let Product = require('./product')
var CatProductSchema = new Schema({
    name: { type: String },
    breakcrum_name: { type: String },
    description: { type: String },
    color: { type: String },
    childs: { type: Array },
    children: { type: Array },
    styles: { type: Array },
    arr_id_product:{ type: Array },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CatProduct'
    },
    parent: { type: Array },
    alias: { type: String },
    slug: { type: String },
    home: { type: Number, default: 0 },
    focus: { type: Number, default: 0 },
    iconNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    },
    iconPath: { type: String },
    imageNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    },
    imagePath: { type: String },
    imageArray: { type: Array },
    title_seo: { type: String },
    description_seo: { type: String },
    keyword_seo: { type: String },
});
module.exports = mongoose.model('CatProduct', CatProductSchema);
