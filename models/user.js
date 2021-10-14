var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var userSchema = new Schema({
    name: { type: String, default: '' },
    username: { type: String, default: '' },
    idepay: { type: String, default: '' },
    introduce: { type: String, default: '' },
    firstname: { type: String, default: '' },
    lastname: { type: String, default: '' },
    birthday: { type: Date, default: Date.now },
    gender: { type: Number, default: 0},
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address'
    },
    arr_parent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    parent_id: { type: String, default: '' },
    active: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    master: { type: Number, default: 0 },
    zalo: { type: String, default: '' },
    facebook: { type: String, default: '' },
    gplus: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, default: '' },
    country: { type: Number, default: 0 },
    province: { type: Number, default: 0 },
    district: { type: Number, default: 0 },
    wards: { type: Number, default: 0 },
    supplier: {type: String, default: ''},
    token_confirm: { type: String, default: '' },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
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
    wallet_id4: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet_v4'
    },
    wallet_id5: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet_v5'
    },
    wallet_id6: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet_v6'
    },
    status: { type: Number, default: 0 },
    datatime: { type: String },
    tracking: { type: String },
    id_npp: { type: String, default: ''},
    id_npp_parent: { type: String, default: '' },
    id_tdl: { type: String, default: ''},
    id_dl: { type: String, default: ''},
    imagePath: { type: String, default: '' },
    imageNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gallery'
    },
    create_at: { type: Date },
    update_at: { type: Date },
    check_update_wallet: {type: Number, default: 0},
    id_facebook: { type: String, default: "" }
})
userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
};
module.exports = mongoose.model('User', userSchema);
