const mongoose = require("./init");
const Schema = mongoose.Schema;

const groupEventSchema = new Schema({
    groupId: String,
    subUser: String,
    obUser: String,
    event: String,
    date: {
        type: Number,
        default: Math.floor(new Date().getTime() / 1000.0)
    }
})

const GroupEvent = mongoose.model('GroupEvent', groupEventSchema)
module.exports = GroupEvent;