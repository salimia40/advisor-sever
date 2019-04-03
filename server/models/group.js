const mongoose = require("./init");

const Schema = mongoose.Schema;
const groupSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    logo: {
        large: String,
        small: String
    },
    info: String,
    Members: [Schema.Types.ObjectId]
});

groupSchema.statics.findGroup = function (name) {
    return this.find().where('name', name)
}

groupSchema.query.search = function (q) {
    return this.or([{
            name: {
                $regex: q
            }
        }, {
            info: {
                $regex: q
            }
        }])
        .sort({
            date: -1
        });
}

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;