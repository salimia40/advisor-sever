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

var messageSchema = new Schema({
    from: { type: ObjectId, ref: _user2.default },
    to: { type: ObjectId, ref: _user2.default },
    reply: { isReply: { type: Boolean, default: false }, to: { type: ObjectId, ref: 'messageSchema' } },
    content: {
        text: String,
        image: String,
        voice: String,
        file: String
    },
    state: {
        sent: { type: Boolean, default: true },
        received: { type: Boolean, default: false },
        viewed: { type: Boolean, default: false }
    }
});

var Message = _init2.default.model('Message', messageSchema);
exports.default = Message;