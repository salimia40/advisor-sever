const express = require("express");
const http = require("http");
const connectionListener = require("./io/connection");
const log = require("./log/log");
const uuid = require("uuid");
const fileUpload = require("express-fileupload");
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
const path = require('path');

app.use(fileUpload());
//@post     /upload     link upload a file to server
//@param    file        file to upload
app.post('/upload', (req, res) => {

    /** @namespace req.files */
    if (Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let file = req.files.file;

    log.info(`new file uploaded to server:      ${file.name}`);
    let name = uuid() + path.extname(file.name);
    log.info(`new file renamed to:      ${name}`);
    file.mv(__dirname + `/uploads/${name}`, function (err) {
        if (err)
            return res.status(500).send(err);
        res.json({ success: true, name: name });
    });
});

//serve public folder for web app
//built web app will be placed here
app.use(express.static('public'));
//@get /files/* to download files
app.use('/files', express.static('uploads'));
//start listening to socket
io.on("connection", connectionListener);
//start server
const port = require('./config').port;
server.listen(port, function () {
    log.info(`listening on port:  ${port}`);
});