const mongoose = require("./init");

const Schema = mongoose.Schema;
const groupSchema = new Schema({
    name: {type: String, required: true, unique: true},
    info: String,
    Members: [Schema.Types.ObjectId]
});

const Group = mongoose.model('Group',groupSchema);
module.exports = Group;