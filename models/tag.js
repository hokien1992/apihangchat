var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let TagSchema = new Schema({
    label: { type: String, unique: true},
    name: { type: String},
    alias: { type: String },
    title_seo: { type: String },
    description_seo: { type: String },
    keyword_seo: { type: String },
});
module.exports = mongoose.model('Tag', TagSchema);