var mongoose = require('mongoose')
var Schema = mongoose.Schema
let Product = require('./new')
var CatProductSchema = new Schema({
    name: { type: String },
    home: { type: Number },
    focus: { type: Number },
    breakcrum_name: { type: String },
    description: { type: String },
    color: { type: String },
    childs: { type: Array },
    children: { type: Array },
    styles: { type: Array },
    arr_id_product:{ type: Array },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catnew'
    },
    parent: { type: Array },
    alias: { type: String },
    slug: { type: String },
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
module.exports = mongoose.model('Catnew', CatProductSchema);