const Student = require('../../models/student'),
User = require('../../models/user')

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
            console.log('called')
            console.log(req.user)
            if(req.user.role == 'student') {
                let advisor = await User.findById(req.user.advisorId)
                return res.json(advisor)
            }
            res.json(req.user)
        })
}