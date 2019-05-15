const
    GroupPost = require('../../models/groupPost'),
    GroupComment = require('../../models/gComment')

module.exports = (router) => {

    router.route('/post')
        /**
         * @body
         * memberId
         * groupId
         * title
         * tags
         * 
         * @body #content
         * text: String,
         * image: String,
         * voice: String
         * file: String,
         * video
         */
        .post(async (req, res) => {
            let post
            let pid = req.body.pid
            let gid = req.body.gid
            let mid = req.body.mid

            if(pid != undefined) {
                post = await GroupPost.findById(pid)
                return res.json(post)
            } 

            if(gid != undefined) {
                let posts = await GroupPost.find({
                    groupId: gid,
                    deleted: false
                }).sort({date : -1}).limit(200)
                return res.json(posts)
            } 

            if(gid != undefined) {
                let posts = await GroupPost.find({
                    memberId: mid,
                    deleted: false
                }).sort({date : -1}).limit(200)
                return res.json(posts)
            } 

            let memberId = req.body.memberId,
                groupId = req.body.groupId,
                title = req.body.title,
                tags = JSON.parse(req.body.tags),
                content = {
                    text: req.body.text,
                    image: req.body.image,
                    voice: req.body.voice,
                    video: req.body.video,
                    file: req.body.file
                },
                followers = [req.user.id]
             post = new GroupPost({
                groupId,
                memberId,
                title,
                tags,
                content,
                followers
            })
            post = await post.save()
            res.json(post)
            // post event
        })
        .patch(async (req, res) => {
            let post = await GroupPost.findById(req.body.pid)
            let
                title = req.body.title,
                tags = JSON.parse(req.body.tags),
                text = req.body.text,
                image = req.body.image,
                voice = req.body.voice,
                video = req.body.video,
                file = req.body.file

                if(title != undefined) post.title = title
                if(tags != undefined) post.tags = tags
                if(text != undefined) post.content.text = text
                if(image != undefined) post.content.image = image
                if(voice != undefined) post.content.voice = voice
                if(video != undefined) post.content.video = video
                if(file != undefined) post.content.file = file
            
            post = await post.save()
            res.json(post)
            // post event
        })
        .delete(async (req,res) => {
            let post = await GroupPost.findById(req.body.pid)
            post.deleted = true
            post = await post.save()
            res.sendStatus(200)
        })

    router.route('/post/follow')
        .post(async (req,res) => {
            let post = await GroupPost.findById(req.body.pid)
            var i = post.followers.indexOf(req.user.id)
            if(i == -1) return res.sendStatus(200)
            post.followers.slice(i, i)
            post = await post.save()
            return res.json(post)
        })
    
    router.route('/post/like')
        .post(async (req,res) => {
            let post = await GroupPost.findById(req.body.pid)
            if (post.likes) {
                var i = post.likes.indexOf(_user.id)
                if (i == -1) post.likes.slice(i, i)
                else post.likes.push(_user.id)
            } else post.likes = [_user.id]
            post = await post.save()
            return res.json(post)
        })

    router.route('/post/comment')
        .post(async (req,res) => {
            let pid = req.body.pid
            if(pid != undefined) {
                let comments = await GroupComment.find({
                    gPostId: data.pid
                })
                return res.json(comments) 
            }
            // adding comment
            let memberId = req.body.memberId
            let gPostId = req.body.gPostId
            let content = {text : req.body.memberId, image : req.body.memberId }

            let comment = new Comment({memberId,gPostId,content})
            comment = await comment.save()
            let p = await GroupPost.findById(req.body.gPostId)
            // follow post
            if (p.followers.indexOf(_user.id) == -1) p.followers.push(_user.id)
            await p.save()
            res.json(comment)
            // todo notify folower
        })
}