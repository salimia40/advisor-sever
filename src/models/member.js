const mongoose = require("./init");

const Schema = mongoose.Schema;
console.log(mongoose);
const memberSchema = new Schema({
    role: {type: String , default :'member' }  /** admin owner */,
    userId: {type: mongoose.Schema.Types.ObjectId},
    groupId: {type: mongoose.Schema.Types.ObjectId},
});


const Member = mongoose.model('GroupMember',memberSchema);
module.exports =  Member;