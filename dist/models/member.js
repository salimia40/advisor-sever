'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _group = require('./group');

var _group2 = _interopRequireDefault(_group);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _init2.default.Schema;
var memberSchema = new Schema({
    role: 'member' /** admin owner */
    , userId: { type: ObjectId, ref: _user2.default },
    groupId: { type: ObjectId, ref: _group2.default }
});

var Member = _init2.default.model('GroupMember', memberSchema);
exports.default = Member;