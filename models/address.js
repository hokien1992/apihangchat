var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AddressSchema = new Schema({
  user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  active: { type: Number, default: 0 },
  country: { type: Number, default: 0 },
  province: { type: Number, default: 0 },
  district: { type: Number, default: 0 },
  wards: { type: Number, default: 0 },
  house: { type: String, default: "" },
  address: { type: String, default: '' }
})
module.exports = mongoose.model('Address', AddressSchema)
