var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
const Gallery = require('./gallery');
var adminSchema = new Schema({
    email: { type: String },
    password: { type: String },
    name: { type: String },
    image: { type: String },
    birthday: { type: Date },
    phone: { type: String },
    zalo: { type: String },
    facebook: { type: String },
    gplus: { type: String },
    description: { type: String },
    website: { type: String },
    address: { type: String },
    active: { type: Number },
    arrayPermission: { type: Object },
    role_id: { type: String },
    imageNumber: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    },
    imagePath: { type: String }
});
adminSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
adminSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password)
};
module.exports = mongoose.model('Admin', adminSchema);