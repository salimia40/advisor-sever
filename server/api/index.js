const express = require('express'),
    mainRouter = express.Router(),
    authenticatedRouter = express.Router(),
    routes = require('./routes')

const checkAuth = function (req, res, next) {
    var token = req.header('token')
    console.log(req.header('token'))
    if (!token) res.sendStatus(401)
    else {
        req.user = token
        next()
    }
}

module.exports = (app) => {
    app.use(express.json()); // to support JSON-encoded bodies
    app.use(express.urlencoded({extended:true})); // to support URL-encoded bodies
    
    // validate token and add user to request
    authenticatedRouter.use(checkAuth)
    routes.userRoutes(authenticatedRouter)
    mainRouter.use('/auth', authenticatedRouter)
    routes.fileRoutes(mainRouter)
    routes.authRoutes(mainRouter)

    app.use('/api', mainRouter)

    /**
     * serve public folder for web router
     * built web router will be placed here
     */
    app.use(express.static('public'));

}