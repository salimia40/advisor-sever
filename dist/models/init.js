"use strict";

// database connection
var mongoose = require("mongoose");

var log = "../log";

var config = require("../config");

mongoose.connect(config.db_url, { useNewUrlParser: true, useCreateIndex: true }).then(function () {
    log.info('connected to db');
}).catch(function (err) {
    log.info(err.message);
});

// mongoose.set('useCreateIndex', true);

// export default mongoose;
exports = mongoose;