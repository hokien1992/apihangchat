var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NotifySchema = new Schema({
  user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  exchange_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exchange'
  },
  content: { type: String, default: "" },
  status: { type: Number, default: 0 },
  active: { type: Number, default: 0 },
})
module.exports = mongoose.model('Notify', NotifySchema)
