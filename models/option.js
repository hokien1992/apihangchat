var mongoose = require('mongoose')
var Schema = mongoose.Schema
var optionSchema = new Schema({
    name: { type: String },
    type: { type: String },
    sort: { type: Number },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Option'
    },
    imageNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    },
    imagePath: { type: String },
    arrChild: [],
    dataChild: [],
})
module.exports = mongoose.model('Option', optionSchema)
