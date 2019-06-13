const User = require('../../models/user'),
    Student = require('../../models/student'),
    uuid = require('uuid'),
    Queue = require('../../models/queue'),
    Protocol = require('../../io/protocol'),
    mailer = require('../../mail')()

module.exports = (router) => {
    router.route('/student')
        .get(async (req,res) => {
            if(req.user.role == 'student'){
                let student = await Student.findOne({
                    userId: req.user.id
                })
                return res.json(student)
            }
            let students = await Student.find({advisorId: req.user.id})
            return res.json(students)
        })
        .post( async (req,res) => {
            if(req.body.uid) {
                let student = await Student.find({userId: req.body.uid})
                if(!student) return res.sendStatus(404)
                if(student.advisorId == req.user.id) return res.json(student)
                return res.sendStatus(401)
            }
            if(req.user.role != 'student') return resizeBy.sendStatus(400)
            let student = await Student.findOne({
                userId: req.user.id
            })
            student = Object.assign(student, req.body)
            student = await student.save()
            res.json(student)
        })


    router.route('/advisor')
        .get(async (req,res)=> {
            if(req.user.role == 'student') {
                let advisor = await User.findById(req.user.advisorId)
                return res.json(advisor)
            }
            res.json(req.user)
        })


    router.route('/student/add')
        .post(async (req,res) => {
            let username = req.body.username,
            password = req.body.password,
            email = req.body.email,
            name = req.body.name,
            role = 'student',
            advisorId = req.user.id

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
            
        
            res.status(200).json({
                success: true,
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