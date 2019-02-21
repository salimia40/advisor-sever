const mongoose = require("./init");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, },
    date: {type: Date, default: Date.now},
    content: {
        text: String,
        image: String,
    }
});

const blogSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, },
    date: {type: Date, default: Date.now},
    document:String,
    title:String,
    comments:[commentSchema]
});

const Blog = mongoose.model('Blog',blogSchema);
module.exports = Blog;