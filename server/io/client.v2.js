const jwt = require('../jwt')()

module.exports = (io) => {

    return (client) => {
        console.log(client.id);
        let token = client.handshake.query.token;
        // check auth
        if(token){
            //validate tocken
            validateTocken(token).then(user => {
                console.log(user)
            }).catch(reason => {
                console.log(reason)
            });

        }else {
            // not autenticated
            // provide login and register
            onTocken = (data) => {

            }
            
        }
    }
}

const validateTocken = (token) => {
    return new Promise((res,rej)=> {
        let auth = jwt.decode(token)
        // checking heath of token
        if(auth.pass && auth.id) {
            res(auth)
        } else {
            rej('invalid tocken')
        }
    })
}