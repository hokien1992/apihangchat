var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Wallet_v1Schema = new Schema({
    w_commission: { type: Number },
    w_consumption: { type: Number },
    w_akie: { type: Number },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    arr_id_order: {
      [
          {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Order'
          }
      ]
    }
})
module.exports = mongoose.model('Wallet_v1', Wallet_v1Schema)
