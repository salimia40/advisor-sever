const {encode,decode} = require('../server/jwt')()


var auth = {
    id : 'kdopafkj0-93iwpdkdkas',
    pass : 'asra18'
}

var num = 22;
var string = 'this is a test'


var encoded = encode(auth)
console.log(encoded)

 console.log(decode(encoded))
