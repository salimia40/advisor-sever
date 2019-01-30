// database connection

const log = require('../log/log');

const db = require('../config').db_url;
mongoose
    .connect(db,{ useNewUrlParser: true })
    .then(() => { log.info('connected to db') })
    .catch((err) => { log.warn(err.message) });

module.exports = mongoose;