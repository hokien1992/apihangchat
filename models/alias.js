var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AliasSchema = new Schema({
    name: { type: String },
    title: { type: String },
    alias: { type: String },
    path: { type: String },
    slug: { type: String },
    id_table: { type: String },
    name_table: { type: String }
});
module.exports = mongoose.model('Alias', AliasSchema);