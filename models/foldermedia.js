var mongoose = require('mongoose')
var Schema = mongoose.Schema
var FoldermediaSchema = new Schema({
    title: { type: String },
    name: { type: String },
    id_arr_gallery: { type: Array },
    parent_id: { type: String },
    path: { type: String },
})
module.exports = mongoose.model('Foldermedia', FoldermediaSchema)