var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var LadingSchema = new Schema({
  code_order: { type: String, default: '' },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  note: { type: String, default: "" },
  content: { type: String, default: "" },
  create_at: { type: Date, default: Date.now },
  notify: { type: Number, default: 0 },
  type: { type: Number, default: 0 },
  ORDER_NUMBER: { type: String, default: '' },
  MONEY_COLLECTION: { type: String, default: '' },
  EXCHANGE_WEIGHT: { type: String, default: '' },
  MONEY_TOTAL: { type: String, default: '' },
  MONEY_TOTAL_FEE: { type: String, default: '' },
  MONEY_FEE: { type: String, default: '' },
  MONEY_COLLECTION_FEE: { type: String, default: '' },
  MONEY_OTHER_FEE: { type: String, default: '' },
  MONEY_VAS: { type: String, default: '' },
  MONEY_VAT: { type: String, default: '' },
  KPI_HT: { type: String, default: '' },
})
module.exports = mongoose.model('Lading', LadingSchema)
