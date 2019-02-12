// database connection
const mongoose = require('mongoose');
const log = require('../log/log');

const db = require('../config').db_url;
mongoose
    .connect(db,{ useNewUrlParser: true })
    .then(() => { log.info('connected to db') })
    .catch((err) => { log.warn(err.message) });
mongoose.set('useCreateIndex', true);
module.exports = mongoose;
