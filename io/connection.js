const log = require('../log/log');

connectionListener = (client)=> {
    log.info(`new socket connected: ${client.info}`);
};

module.exports = connectionListener;