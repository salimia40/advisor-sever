const Blog = require('../../models/blog'),
    Comment = require('../../models/comment')

module.exports = (router) => {
    router.route('/blog')
        .get(async (req,res) => {
            let aid;
            if (req.user.role == 'advisor') aid = req.user.id
            else aid = req.user.advisorId
            let blogs = await Blog.find().byUser(aid)
            res.json(blogs)
        })
        .post(async (req,res) => {
            if (req.user.role != 'advisor') return res.sendStatus(401)
            let title = req.body.title,
            document = req.body.document,
            userId = req.user.id
            
            let blog = new Blog({
                title,document,userId
            });
            
            blog = await blog.save();
            res.json(blog)
            // todo call messenger
        })
        .patch(async (req,res) => {
            if (req.user.role != 'advisor') return res.sendStatus(401)
            if (req.body.bid == undefined) return res.sendStatus(400)
            
            let blog = await Blog.findById(req.body.bid)
            if (req.user.id != blog.userId) return res.sendStatus(401)
            if (req.body.bid != undefined) blog.title = req.body.title;
            if (req.body.bid != undefined) blog.document = req.body.document;

            blog = await blog.save()
            res.json(blog)
            // todo call messenger
        })
        .delete(async (req,res) => {
            if (req.user.role != 'advisor') return res.sendStatus(401)
            if (req.body.bid == undefined) return res.sendStatus(400)            
            let blog = await Blog.findById(req.body.bid)
            if (req.user.id != blog.userId) return res.sendStatus(401)
            blog.deleted = true
            blog = await blog.save()
            res.json(blog)
            // todo call messenger
        })

    router.route('/comment')
        .get(async (req,res) => {
            let aid;
            if (req.user.role == 'advisor') aid = req.user.id
            else aid = req.user.advisorId
            let blogs = await Blog.find().byUser(aid)
            let comments = [];
            await blogs.forEach(async b => {
                let bcs = await Comment.find().byBlog(b.id)
                comments.push.apply(comments,bcs)
            });
            res.json(comments)
        })
        .post(async (req,res) => {
            let blogId = req.body.blogId,
            userId = req.user.id,
            text = req.body.text,
            image = req.body.image
            let content = {text,image}
            let comment = new Comment({blogId,userId,content})
            comment = await comment.save()
            res.json(comment)
            // todo call messenger
        })
        .delete(async (req,res) => {
            console.log(req.body)
            if (req.body.cid == undefined) return res.sendStatus(400)
            let comment = await Comment.findById(req.body.cid)
            if (req.user.id != comment.userId) return res.sendStatus(401)
            comment.deleted = true
            res.sendStatus(200)
            // todo call messenger
        })
}