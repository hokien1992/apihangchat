var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PermissionSchema = new Schema({
    name: { type: String },
    keyname: { type: String },
    description: { type: String },
    parent_id: { type: Number },
    path: { type: String },
});
module.exports = mongoose.model('Permission', PermissionSchema);