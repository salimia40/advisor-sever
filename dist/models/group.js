'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _member = require('./member');

var _member2 = _interopRequireDefault(_member);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _init2.default.Schema;
var groupSchema = new Schema({
    name: { type: String, required: true, unique: true },
    info: String,
    Members: [{ type: ObjectId, ref: _member2.default }]
});

var Group = _init2.default.model('Group', groupSchema);
exports.default = Group;