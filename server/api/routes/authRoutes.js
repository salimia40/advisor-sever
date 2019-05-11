module.exports = (router) => {

    router
        .route('/login')
        .post((req, res) => {
            let username = req.body.username,
                password = req.body.password
            
            console.log(req.body)
            if(username && password) {
                res.send('hi')
            } else res.sendStatus(400)
        })

}