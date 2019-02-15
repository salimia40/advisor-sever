'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var log = require('./logger').createLogger(__dirname + '/logs.log');
// 'fatal', 'error', 'warn', 'info', 'debug'
log.setLevel('debug');

var options = {
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric'
};
var formatter = new Intl.DateTimeFormat([], options);

log.format = function (level, date, message) {
  return '  ' + level + ':    ' + formatter.format(date) + '    ' + message;
};

// TODO report daily details about app events,messages,logins,and ect.

var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.hour = 17;
rule.minute = 0;

schedule.scheduleJob(rule, function () {});

exports.default = log;