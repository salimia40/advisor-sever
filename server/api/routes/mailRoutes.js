const User = require('../../models/user')

module.exports = (router) => {
 router.route('/:id/:code')
    .get(async(req,res) => {
        let user = await User.findById(req.params.id)
        if(req.params.code == user.email.confirmCode) {
            user.email.confirmed = true
            await user.save()
            return res.status(200).json('email confirmed')
        }
        res.sendStatus(400)
    } )   
}