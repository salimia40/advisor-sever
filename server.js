const express = require("express");
const http = require("http");
const clientHandler = require("./io/clientHandler");
const log = require("./log/log");
const uuid = require("uuid");
const fileUpload = require("express-fileupload");
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
const path = require('path');
const fs = require('fs');

app.use(fileUpload());
//@post     /upload     link upload a file to server
//@param    file        file to upload

fs.exists(path.join(__dirname,'/uploads'), exists => {
    if(!exists){
        fs.mkdir(path.join(__dirname,'/uploads'), err => {if(err) throw err} );
    }
});

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
app.get('/log',(req,res)=>{
    res.download(__dirname + '/log/logs.log')
})
//start listening to socket
io.on('connection', clientHandler);
//start server
const port = require('./config').port;
server.listen(port, function () {
    log.info(`listening on port:  ${port}`);
    console.log(`listening on port:  ${port}`);
});