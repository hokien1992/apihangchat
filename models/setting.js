var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SettingSchema = new Schema({
    name: { type: String },
    company: { type: String },
    slogan: { type: String },
    website: { type: String },
    address: { type: String },
    email: { type: String },
    facebook: { type: String },
    gplus: { type: String },
    zalo: { type: String },
    linken: { type: String },
    twitcher: { type: String },
    hotline: { type: String },
    phone: { type: String },
    description: { type: String },
    parent_id: { type: Number },
    code_styles: { type: String },
    code_scripts: { type: String },
    lang: { type: String },
    app_gmail: { type: String, default: '' },
    app_password: { type: String, default: '' },
    address_id: { type: String, default: '' },
    logo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    },
    favicon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallery'
    },
    title_seo: { type: String },
    description_seo: { type: String },
    keyword_seo: { type: String },
});
module.exports = mongoose.model('Setting', SettingSchema);
