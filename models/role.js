var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var RoleSchema = new Schema({
    name: { type: String },
    arrayPermission: { type: Object },
    permission: [
        {
            data: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Permission',
            },
            text: { type: String }
        }
    ],
    description: { type: String }
});
module.exports = mongoose.model('Role', RoleSchema);