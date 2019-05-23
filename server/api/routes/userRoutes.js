const
    uuid = require('uuid'),
    User = require('../../models/user'),
    mailer = require('../../mail')()

module.exports = (router) => {
    router.route('/user')
        .get(async (req, res) => {
            let user = JSON.parse(JSON.stringify(req.user))
            delete user.password
            delete user.email.confirmCode
            res.send(user)
        })
        .post( async (req, res) => {

            let query = req.body.query
            if (query != undefined) {
                console.log(query)
                let users = await User.findUsers(query)
                console.log(users)
                // todo encapsulate users
                return res.json(users)
            }

            let uid = req.body.uid
            if (uid != undefined) {
                let user = await User.findById(uid)
                // todo encapsulate user
                return res.json(user)
            }

            let email = req.body.email,
                name = req.body.name,
                bio = req.body.bio,
                avatarSmall = req.body.avatarSmall,
                avatarLarge = req.body.avatarLarge

            let user = req.user

            if (email != undefined) {
                user.email = {
                    email: email,
                    confirmed: false,
                    confirmCode: uuid()
                }
                mailer.cofirmEmail(user.email.email, user.name, user.id, user.email.confirmCode)
            }

            //  console.log(req)
            if (name != undefined) {
                user.name = name
            }
            if (bio != undefined) user.bio = bio
            if (avatarSmall != undefined && avatarLarge != undefined) user.avatar = {
                large: avatarLarge,
                small: avatarSmall
            }

            await user.save()
            res.json(user)

        })

    router.route('/user/password')
        .post( async (req, res) => {
            let passwordNew = req.body.passwordNew,
                password = req.body.password

            if (password == undefined || passwordNew == undefined) return res.sendStatus(400)
            try {
                let response = await User.changePassword(req.user, password, passwordNew)
                res.status(200).json(response)
            } catch (error) {
                res.status(401).json(error)
            }
        })
}