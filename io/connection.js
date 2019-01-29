connectionListener = function(client) {
    log.info(`new socket connected: ${client.info}`);
};

module.exports = connectionListener;