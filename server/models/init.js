// database connection
const mongoose = require("mongoose");

const log = require("../log");

const config = require("../config");

mongoose
    .connect(config.db_url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        authSource: 'admin'
    })
    .then(() => {
        log.info('connected to db')
    })
    .catch((err) => {
        log.info(err.message)
    });

// mongoose.set('useCreateIndex', true);

// export default mongoose
module.exports = mongoose;