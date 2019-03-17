const mongoose = require("./init");

const Schema = mongoose.Schema;

const blogSchema = new Schema({
    userId: {type: String, },
    date: {type: Date, default: Date.now},
    document:String,
    title:String,
    comments:[String],
    deleted : {type:Boolean,default:false}
});

blogSchema.query.byUser =  function(userId) {
    return this.where({userId : userId})
} 

const Blog = mongoose.model('Blog',blogSchema);
module.exports = Blog;