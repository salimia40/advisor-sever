const User = require('../../models/user'),
    Student = require('../../models/student'),
    uuid = require('uuid'),
    Queue = require('../../models/queue'),
    Protocol = require('../../io/protocol'),
    jwt = require('../../jwt')(),
    mailer = require('../../mail')()

module.exports = (router) => {

    router
        .route('/login')
        .post((req, res) => {
            let username = req.body.username,
                password = req.body.password

            if (!(username && password)) return res.sendStatus(400)
            User.findByUsername(username).then(user => {
                if (!user) return res.status(404).json({
                    success: false,
                    message: 'user not found'
                });
                user.checkPassword(password).then(isMatch => {
                    if (!isMatch) return res.status(406).json({
                        success: false,
                        message: 'incorrect password'
                    });

                    let auth = {
                        id: user.id,
                        password
                    }

                    let token = jwt.encode(auth)
                    return res.status(200).json({
                        success: true,
                        token,
                        message: 'login successful',
                    })
                })
            }).catch(err => {
                console.log(err)
                res.sendStatus(501)
            })

        })

    router
        .route('/register')
        .post(async (req, res) => {
            let username = req.body.username,
                password = req.body.password,
                email = req.body.email,
                name = req.body.name,
                role = req.body.role,
                advisorId = req.body.advisorId

            let user = new User({
                username,
                password,
                name,
                role,
                advisorId
            })

            user.email = {
                email: email,
                confirmed: false,
                confirmCode: uuid()
            }

            try {

                let existing = await User.findByUsername(user.username)

                if (existing)
                    return res
                        .status(409)
                        .json({
                            success: false,
                            message: 'user already exists'
                        });

                user = await User.createUser(user)
                delete user.password

                createQueue(user);
                if (isStudent(user)) createStudent(user)
                sendConfirmEmail(user)

                let auth = {
                    id: user.id,
                    password
                }

                let token = jwt.encode(auth)

                res.status(200).json({
                    success: true,
                    token,
                    message: 'user created'
                });

            } catch (error) {
                console.log(error)
                res.sendStatus(501)
            }

        })


    // helper methodes

    /**
     * creates a blank queue for user
     * 
     * @param {User} user 
     * @requires user.id
     */
    function createQueue(user) {
        var queue = new Queue({
            userId: user.id
        });
        queue.save();
    }

    /**
     * ckecks if user is student
     * @param {User} user 
     * @requires user.role
     * @returns {Boolean}
     */
    function isStudent(user) {
        return user.role === Protocol.UserTypes.student
    }

    /**
     * creates an student doc for user
     * @param {User} user 
     * @emits client#STUDENT_GET
     * 
     */
    function createStudent(user) {
        var student = new Student();
        student.username = user.username;
        student.userId = user._id;
        student.advisorId = user.advisorId;
        student.save().then(st => {});
    }

    function sendConfirmEmail(user) {
        mailer.cofirmEmail(user.email.email, user.name, user.id, user.email.confirmCode)
    }

}