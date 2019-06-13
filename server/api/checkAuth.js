const User = require('../models/user'),
    jwt = require('../jwt')()


module.exports = async function (req, res, next) {
    var token = req.header('token')
    if (!token) return res.sendStatus(401)
    let auth = jwt.decode(token)
    if(auth.id == undefined || auth.password == undefined) return res.sendStatus(400)
    var user = await User.findById(auth.id)
    if(user == undefined) return res.sendStatus(401)
    var isMatch = await user.checkPassword(auth.password)
    if (isMatch) {
        req.user = user
        return next()
    } else return res.sendStatus(401)
}
