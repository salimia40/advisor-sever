const mongoose = require("./init");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    userId: {type: String, },
    blogId: {type: String, },
    date: {type: Date, default: Date.now},
    content: {
        text: String,
        image: String,
    },
    deleted : {type:Boolean,default:false}
});

commentSchema.query.byBlog = function(bid){
    return Comment.find().where(blogId,bid)
}

const Comment = mongoose.model('Comment',commentSchema);
module.exports = Comment;