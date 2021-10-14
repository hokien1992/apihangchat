var mongoose = require('mongoose')
var Schema = mongoose.Schema
const Tag = require('./tag')
const Gallery = require('./gallery')
var newSchema = new Schema({
    name: { type: String },
    alias: { type: String },
    slug: { type: String },
    style_ids: { type: Array },
    limitCat: { type: Array },
    code: '',
    count: { type: Number, default: 0 },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catnew'
    },
    home: { type: Number },
    focus: { type: Number },
    left: { type: Number },
    right: { type: Number },
    description: { type: String },
    detail: { type: String },
    imageNumber: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    },
    imagePath: { type: String },
    imageArray: { type: Array },
    author: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    comments: [
        {
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Admin',
            },
            text: String
        }
    ],
    tags:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tag'
            }
        ],
    title_seo: { type: String },
    description_seo: { type: String },
    keyword_seo: { type: String },
})
newSchema.methods.comment = function(c){
    this.comments.push(c);
    return this.save();
}
module.exports = mongoose.model('New', newSchema);