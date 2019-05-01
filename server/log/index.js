var fs = require("fs");

const options = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
};
const formatter = new Intl.DateTimeFormat([], options);

var format = function (level, date, message) {
  return `  ${level}:   ${formatter.format(date)}   ${message}`;
};

function BuildLogger(file = '/logs.log') {

  var Logger = {}  
  var stream = fs.createWriteStream(__dirname+file ,{flags: 'a', encoding: 'utf8', /*mode: 0666*/});

  const levels = [
    'emerg',
    'alert',
    'crit',
    'error',
    'warning',
    'notice',
    'info',
    'debug',
  ];

  levels.forEach((level,i) => {
    Logger[level] = (msg) => {
      stream.write(format(level,new Date(),JSON.stringify(msg, null, 4)) )
      if(i <= levels.indexOf('error')){
        var trace = new Error().stack;
        stream.write("\n\t\t Stack Trace:");
        var sample = '\\log\\index.js:'
        while(trace.includes(sample)) trace = trace.slice(trace.indexOf(sample) + sample.length)
        trace = trace.slice(trace.indexOf(')') + 1)
        stream.write(trace)
        stream.write("\n");
      }
      stream.write("\n");
    }
  })
  return Logger;
}

module.exports = BuildLogger();