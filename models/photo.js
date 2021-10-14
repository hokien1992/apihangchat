var mongoose = require('mongoose')
var Schema = mongoose.Schema
var PhotoSchema = new Schema({
    title: { type: String },
    name: { type: String },
    keyname: { type: String },
    style_id: { type: String },
    link: { type: String },
    imageNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery',
    },
    imagePath: { type: String },
})
module.exports = mongoose.model('Photo', PhotoSchema)