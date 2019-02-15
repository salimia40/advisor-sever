"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _init = require("./init");

var _init2 = _interopRequireDefault(_init);

var _user = require("./user");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _init2.default.Schema;

var commentSchema = new Schema({
    userId: { type: ObjectId, ref: _user2.default },
    date: { type: Date, default: Date.now },
    content: {
        text: String,
        image: String
    }
});

var postSchema = new Schema({
    userId: { type: ObjectId, ref: _user2.default },
    date: { type: Date, default: Date.now },
    document: String,
    title: String,
    comments: [commentSchema]
});

var Post = _init2.default.model('Post', postSchema);
exports.default = Post;