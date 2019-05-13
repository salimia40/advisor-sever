var nodemailer = require('nodemailer');
var config = require('../config');
// var log = require('../log/log')

module.exports = () => {

    var transporter = nodemailer.createTransport({
        host: 'smtp.zoho.eu',
        port: 465,
        secure: true,
        auth: config.mail
    });

    return {
        cofirmEmail: (emailAdd,name,userId,code) => {
            var mailOptions = {
                from: config.mail.user,
                to: emailAdd,
                subject: 'advisor app confirm link',
                text: `hi ${name} \n\n your confirmation link is: \n https://advisor.puyaars.ir/email/${userId}/${code} \n\n or you could ignore it \n its just a message`
            }
            transporter.sendMail(mailOptions).then(console.log).catch(console.error);
    
        }
    }
}