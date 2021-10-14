var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ExchangeSchema = new Schema({
  wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet_v1'
  },
  wallet_id2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet_v2'
  },
  wallet_id3: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet_v3'
  },
  exchange_rate: { type: Number, default: 0 },
  w_epay: { type: Number, default: 0 },
  w_epay2: { type: Number, default: 0 },
  w_epay3: { type: Number, default: 0 },
  w_epay_prefix: { type: String, default: '' },
  w_epay2_prefix: { type: String, default: '' },
  w_epay3_prefix: { type: String, default: '' },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  user_id_send: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  user_id_receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type_wallet: { type: Number, default: 0 },
  math: { type: String, default: '' },
  percent: { type: Number, default: 0 },
  content: { type: String, default: '' },
  note: { type: String, default: '' },
  sort_id: { type: Number, default: 0 },
  code: { type: String, default: '' },
  number_monney: { type: Number, default: 0 },
  number_epay: { type: Number, default: 0 },
  type_exchange: { type: Number, default: 0 },
  hinhthucthanhtoan: { type: Number, default: 0 },
  sotaikhoan: { type: String, default: '' },
  datatime_exchange: { type: String, default: '' },
  status: { type: Number, default: 0 },
  arr_image: { type: Array },
  create_at: { type: Date },
  update_at: { type: Date, default: Date.now },
})
module.exports = mongoose.model('Exchange', ExchangeSchema)
