const
    express = require('express'),
    helmet = require('helmet'),
    mainRouter = express.Router(),
    mailRouter = express.Router(),
    authenticatedRouter = express.Router(),
    routes = require('./routes'),
    checkAuth = require('./checkAuth')

module.exports = (app,messenger) => {
    // a security middleware
    app.use(helmet())
    app.use(express.json()); // to support JSON-encoded bodies
    app.use(express.urlencoded({
        extended: true
    })); // to support URL-encoded bodies

    // validate token and add user to request
    authenticatedRouter.use(checkAuth)
    routes.userRoutes(authenticatedRouter)
    routes.studentRoutes(authenticatedRouter)
    routes.blogRoutes(authenticatedRouter,messenger)
    routes.groupRoutes(authenticatedRouter,messenger)
    routes.postRoutes(authenticatedRouter,messenger)
    mainRouter.use('/auth', authenticatedRouter)
    routes.fileRoutes(mainRouter)
    routes.authRoutes(mainRouter)
    routes.mailRoutes(mailRouter)

    app.use('/api', mainRouter)
    app.use('/email', mailRouter)

    /**
     * serve public folder for web router
     * built web router will be placed here
     */
    app.use(express.static('public'));

}