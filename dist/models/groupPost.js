"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _member = require("./member");

var _member2 = _interopRequireDefault(_member);

var _init = require("./init");

var _init2 = _interopRequireDefault(_init);

var _group = require("./group");

var _group2 = _interopRequireDefault(_group);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _init2.default.Schema;
var groupCommentSchema = new Schema({
    memberId: { type: ObjectId, ref: _member2.default },
    date: { type: Date, default: Date.now },
    content: {
        text: String,
        image: String
    }
});

var groupPostSchema = new Schema({
    memberId: { type: ObjectId, ref: _member2.default },
    groupId: { type: ObjectId, ref: _group2.default },
    date: { type: Date, default: Date.now },
    document: String,
    title: String,
    comments: [groupCommentSchema]
});

var GroupPost = _init2.default.model('GroupPost', groupPostSchema);
exports.default = GroupPost;