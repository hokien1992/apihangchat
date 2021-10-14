var mongoose = require('mongoose')
var Schema = mongoose.Schema
var PageSchema = new Schema({
    name: { type: String },
    home: { type: Number },
    focus: { type: Number },
    breakcrum_name: { type: String },
    description: { type: String },
    detail: { type: String },
    color: { type: String },
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
module.exports = mongoose.model('Page', PageSchema);