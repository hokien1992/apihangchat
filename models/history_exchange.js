var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HistoryExchangeSchema = new Schema({
  wallet_id: { type: String },
  history_content: { type: String },
})
module.exports = mongoose.model('History_exchange', HistoryExchangeSchema)
