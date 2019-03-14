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
};


module.exports = log;