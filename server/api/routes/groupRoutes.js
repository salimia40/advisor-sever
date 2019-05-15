const Group = require('../../models/group'),
    GroupEvent = require('../../models/gEvent'),
    GroupPost = require('../../models/groupPost'),
    GroupComment = require('../../models/gComment'),
    Protocol = require('../../io/protocol')

module.exports = (router) => {
    router.route('/group')
        .get(async (req, res) => {
            let members = await Member.find({
                userId: req.user.id
            })
            let groups = []
            await members.forEach(async m => {
                let group = await Group.findById(m.groupId)
                groups.push(group)
            });
            res.json(groups)
        })
        .post(async (req, res) => {
            let gid = req.body.gid,
                query = req.body.query,
                name = req.body.name

            let group

            if (gid != undefined) {
                group = await Group.findById(gid)
                return res.json(group)
            }

            if (query != undefined) {
                let groups = await Group.find().search(query)
                return res.json(groups)
            }

            // creating g
            group = await Group.findGroup(name)
            if (group) return res.status(409).json('group already exists')
            group = new Group(req.body)
            group = await group.save()
            let member = new Member({
                role: Protocol.GroupRoles.owner,
                groupId: group.id,
                userId: req.user.id
            })
            member.save().exec()
            res.status(201).json(group)
            // todo created event
        })
        .patch(async (req, res) => {
            let body = req.body
            let group = await Group.findById(body.gid)
            delete body.gid
            let owner = Member.findOne({
                userId: req.user.id,
                groupId: group.id,
                role: Protocol.GroupRoles.owner
            })
            if (owner == undefined) return res.sendStatus(401)
            Object.assign(group, body)
            group = await group.save()
            res.status(202).json(group)
            // todo update event
        })
        .delete(async (req, res) => {
            let gid = req.body.gid
            let owner = await Member.findOne({
                userId: req.user.id,
                groupId: gid,
                role: Protocol.GroupRoles.owner
            })
            if (owner == undefined) return res.sendStatus(403)

            GroupEvent.deleteMany({
                groupId: data.gid
            }).exec();

            GroupPost.deleteMany({
                groupId: data.gid
            }).exec();

            res.sendStatus(200)
            // todo notify deleted members
            // todo delete comments
        })

    router.route('/group/event')
        .post(async (req, res) => {
            let events = await GroupEvent.find({
                groupId: req.body.gid
            }).sort({
                date: -1
            }).limit(100)

            res.json(events)
        })

    router.route('/group/member')
        .get(async (req, res) => {
            let members = await Member.find({
                userId: req.user.id
            })
            res.json(members)
        })
        .post(async (req, res) => {
            let groupId = req.body.gid
            let members = await Member.find({
                groupId
            })
            res.json(members)
        })
        .delete(async (req, res) => {
            let groupId = req.body.groupId
            Member.findOneAndDelete({
                groupId,
                userId: req.user.id
            }).exec()
            res.sendStatus(200)
            // todo left event  
        })

    /**
     * @body groupId
     * @body userId
     */
    router.route('/group/join')
        .post(async (req, res) => {

            let adding = false,
                groupId = req.body.groupId,
                userId = req.body.userId

            if (userId == undefined) {
                userId = req.user.id
            } else adding = true

            let member = new Member({
                role: Protocol.GroupRoles.member,
                userId,
                groupId
            })

            member = await member.save()
            res.json(member)


            // if(adding)
            // todo added event
            // send member for added 
            // else
            // todo joined event
        })

    router.route('/group/remove')
        .post(async (req, res) => {
            let groupId = req.body.groupId
            let userId = req.body.userId

            let owner = Member.findOne({
                userId: req.user.id,
                groupId,
                role: Protocol.GroupRoles.owner
            })
            if (owner == undefined) return res.sendStatus(401)
            Member.findOneAndDelete({
                groupId,
                userId
            }).exec()

            res.sendStatus(200)
        })

}