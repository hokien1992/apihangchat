var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GallerySchema = new Schema({
    title: { type: String },
    keyname: { type: String },
    style_id: { type: String },
    path: { type: String },
    size: { type: Number },
    filename: { type: String },
    destination: { type: String },
    idFolder: { type: String},
});
module.exports = mongoose.model('Gallery', GallerySchema)