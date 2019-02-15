'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _init2.default.Schema;
var studentSchema = new Schema({

    name: { first: String, last: String },
    advisorId: { type: ObjectId, ref: _user2.default },
    userId: { type: ObjectId, ref: _user2.default },
    username: String,
    Religion: String,
    nationality: String,
    birthPlace: String,
    birthday: { type: Date, default: Date.now },
    entranceDay: { type: Date, default: Date.now },
    fatherName: String,
    sex: { type: String, default: "male" /** "female"*/ },
    education: {
        college: String,
        field: String
    },
    marriage: {
        isMarried: { type: Boolean, default: false },
        partnerName: String,
        children: { type: Number, min: 0 }
    },
    address: String,
    contacts: {
        self: Number,
        father: Number,
        partner: Number,
        home: Number
    },
    leave: {
        has: { type: Boolean, default: false },
        reason: String
    },
    Military: String,
    jop: {
        isOccupied: { type: Boolean, default: false },
        occupation: String,
        address: String
    },
    personal: { lifeEvents: String, hobbies: String, talents: String },
    disease: {
        physical: {
            has: { type: Boolean, default: false },
            name: String
        },
        mental: {
            has: { type: Boolean, default: false },
            name: String
        }
    }
});

studentSchema.statics.CreateStudent = function (user, callback) {
    var student = new this.model('Student')({ username: user.username, userId: user._id, advisorId: user.advisorId });
    student.save(callback);
};

var Student = _init2.default.model('Student', studentSchema);
exports.default = Student;