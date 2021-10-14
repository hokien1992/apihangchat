var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SupplierSchema = new Schema({
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    facebook: { type: String, default: "" },
    zalo: { type: String, default: "" },
    active: { type: Number, default: 0 },
    description: { type: String, default: "" },
    note: { type: String, default: "" },
    parent_id: { type: Number, default: 0 },
    country: { type: Number, default: 0 },
    province: { type: Number, default: 0 },
    district: { type: Number, default: 0 },
    wards: { type: Number, default: 0 },
    address: { type: String, default: "" },
    lat: { type: String, default: "" },
    lng: { type: String, default: "" },
    alias: { type: String, default: "" },
    imageNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gallery'
     },
    imagePath: { type: String, default: "" },
    galleryNumber: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery',
      }
    ],
    title_seo: { type: String, default: "" },
    description_seo: { type: String, default: "" },
    keyword_seo: { type: String, default: "" },
});
module.exports = mongoose.model('Supplier', SupplierSchema);
