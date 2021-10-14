var mongoose = require('mongoose')
var Schema = mongoose.Schema
var optionProductSchema = new Schema({
    name: { type: String, default: '' },
    type: { type: String, default: '' },
    sort: { type: Number, default: 0 },
    qty: { type: Number, default: 0 },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Option_product'
    },
    parent_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Option_product'
      }
    ],
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    imageNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    },
    imagePath: { type: String, default: '' },
    arrChild: { type: Array },
    dataChild: { type: Array },
    arrChildChild: { type: Array },
    price: { type: Number, default: 0 },
    price_prefix: { type: String, default: '' },
    point: { type: Number, default: 0 },
    point_prefix: { type: String, default: '' },
    weight: { type: Number, default: 0 },
    weight_prefix: { type: String, default: '' },
    stock: { type: String, default: '' },
    require: { type: String, default: '' },
})
module.exports = mongoose.model('Option_product', optionProductSchema)
