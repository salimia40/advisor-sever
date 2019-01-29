const log = require('./logger').createLogger( __dirname + '/logs.log');
// 'fatal', 'error', 'warn', 'info', 'debug'
log.setLevel('debug');

const options = {
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric'
};
const formatter = new Intl.DateTimeFormat([], options);

log.format = function(level,date,message){
  return `  ${level}:    ${formatter.format(date)}    ${message}`;
}

// TODO report daily details about app events,messages,logins,and ect.

const schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.hour = 17;
rule.minute = 0;
 
var j = schedule.scheduleJob(rule, function(){
    log.info('daily report created');
});

module.exports = log;