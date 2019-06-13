
const mongoose = require("./init");


const Schema = mongoose.Schema;
const studentSchema = new Schema({

    name: {first: String, last: String,},
    advisorId: {type: Schema.Types.ObjectId, },
    userId: {type: Schema.Types.ObjectId, },
    username: String,
    Religion:String,
    nationality:String,
    birthPlace:String,
    birthday: {type: Date, default: Date.now},
    entranceDay: {type: Date, default: Date.now},
    fatherName: String,
    sex: {type: String, default: "male" /** "female"*/},
    education: {
        college: String,
        field: String
    },
    marriage: {
        isMarried: {type: Boolean, default: false},
        partnerName: String,
        children : {type : Number, min: 0}
    },
    address: String,
    contacts: {
        self: Number,
        father: Number,
        partner: Number,
        home: Number,
    },
    leave: {
        has: {type: Boolean, default: false},
        reason: String
    },
    military: String,
    job: {
        isOccupied: {type: Boolean, default: false},
        occupation: String,
        address: String
    },
    personal: {lifeEvents:String,hobbies:String,talents:String},
    disease: {
        physical:{
            has:{type: Boolean, default: false},
            name: String
        },
        mental:{
            has:{type: Boolean, default: false},
            name: String
        }
    }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;