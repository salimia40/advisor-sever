"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _connection = require("./io/connection");

var _connection2 = _interopRequireDefault(_connection);

var _log = require("./log");

var _log2 = _interopRequireDefault(_log);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _expressFileupload = require("express-fileupload");

var _expressFileupload2 = _interopRequireDefault(_expressFileupload);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var server = _http2.default.Server(app);
var io = require('socket.io')(server);
app.use((0, _expressFileupload2.default)());

//helper for file extensions
var getExtension = function getExtension(s) {
    return s.slice(s.indexOf('.'));
};

//@post     /upload     link upload a file to server
//@param    file        file to upload
app.post('/upload', function (req, res) {

    /** @namespace req.files */
    if (Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    var file = req.files.file;

    _log2.default.info("new file uploaded to server:      " + file.name);
    var name = (0, _uuid2.default)() + getExtension(file.name);
    _log2.default.info("new file renamed to:      " + name);
    file.mv(__dirname + ("/uploads/" + name), function (err) {
        if (err) return res.status(500).send(err);
        res.json({ success: true, name: name });
    });
});
//serve public folder for web app
//built web app will be placed here
app.use(_express2.default.static('public'));
//@get /files/* to download files
app.use('/files', _express2.default.static('uploads'));
//start listening to socket
io.on("connection", _connection2.default);
//start server
var port = require('./config').port;
server.listen(port, function () {
    _log2.default.info("listening on port:  " + port);
});