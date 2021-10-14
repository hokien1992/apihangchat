var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var StylegallerySchema = new Schema({
    title: { type: String },
    name: { type: String },
    keyname: { type: String },
    photo_ids: { type: Array }
});
module.exports = mongoose.model('Stylegallery', StylegallerySchema);