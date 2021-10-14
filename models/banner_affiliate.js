var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Banner_affiliateSchema = new Schema({
    name: { type: String, default: '' },
    imagePath: { type: String, default: '' },
    link: { type: String, default: '' },
    sort: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    description: { type: String, default: 0 },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
});
module.exports = mongoose.model('Banner_affiliate', Banner_affiliateSchema);
