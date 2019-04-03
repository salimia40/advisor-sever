const mongoose = require("./init");

const Schema = mongoose.Schema;
const memberSchema = new Schema({
    role: {
        type: String,
        default: 'member'
    } /** admin owner */ ,
    userId: {
        type: String
    },
    groupId: {
        type: String
    },
});


const Member = mongoose.model('GroupMember', memberSchema);
module.exports = Member;