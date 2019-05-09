const {encode,decode} = require('../server/sec')()


var auth = {
    user : 'puya',
    pass : 'asra18'
}

var num = 22;
var string = 'this is a test'


var encoded = encode(auth)
console.log(encoded)

 console.log(decode(encoded))
