const log = require('../log/log');

/*********************************
 TODO list:
    simple Login and register for advisors
    add email confirmation and password recovery
    student creation and management function for advisors
    post and comment that advisors can create posts and sudents resive their adisor's post and both can comment
    student information updates
    comment replies 
    advisor-student chat
    group chats
*********************************/
connectionListener = (client)=> {
    log.info(`new socket connected: ${client.info}`);
};

module.exports = connectionListener;