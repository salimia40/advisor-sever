const mongoose = require("./init");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    userId: {type: String, },
    date: {type: Date, default: Date.now},
    content: {
        text: String,
        image: String,
    }
    
});

const blogSchema = new Schema({
    userId: {type: String, },
    date: {type: Date, default: Date.now},
    document:String,
    title:String,
    comments:[commentSchema],
    deleted : {type:Boolean,default:false}
});

blogSchema.query.byUser =  function(userId){
    return this.where({userId : userId})
} 

const Blog = mongoose.model('Blog',blogSchema);
module.exports = Blog;