// todo make an array of message ids so when user gets online he recieves em;
const Queue = require("../models/queue");
const Protocol = require('./protocol')
const queueManager = (action) => {
    switch(action.type){
        case Protocol.ActionTypes.message:
        Queue.findOne({userId:action.userId},(err,queue)=>{
            queue.messages.push(action.data.messageId);
            queue.save();
        })
        return;
        default: return;
    }
}

module.exports = queueManager;