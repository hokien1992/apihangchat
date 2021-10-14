var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Wallet_v1Schema = new Schema({
  w_epay: { type: Number, default: 0 },
  w_totalcommisstion: { type: Number, default: 0 },
  w_commission: { type: Number, default: 0 },
  w_consumption: { type: Number, default: 0 },
  w_akie: { type: Number, default: 0 },
  w_milestones: { type: Number, default: 0 }
})
module.exports = mongoose.model('Wallet_v1', Wallet_v1Schema)
