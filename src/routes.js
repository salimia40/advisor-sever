const express = require('express'),
    router = express.Router(),
    uuid = require("uuid"),
    fileUpload = require("express-fileupload"),
    log = require("./log/log"),
    path = require('path'),
    storage = require('./storage')()

router.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
//@post     /upload     link upload a file to server
//@param    file        file to upload
const uploadPath = storage.tempDir;

router.post('/upload', (req, res) => {

    /** @namespace req.files */
    if (Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let file = req.files.file;
    let name = Name(file)
    // storage.saveFileByData(file,name);
    log.info(`new file renamed to:      ${name}`);
    var filepath = `${uploadPath}/${name}`
    file.mv(filepath, function (err) {
        if (err)
            return res.status(500).send(err);
        storage.saveFile(name)
        res.json({
            success: true,
            name: name
        });
    });
});

const Name = (file) => uuid() + path.extname(file.name)

//serve public folder for web router
//built web router will be placed here
router.use(express.static('public'));
//@get /files/* to download files
// router.use('/files', express.static('uploads'));
router.get('/files/:name',(req,res) => {
    console.log(req.params.name)
    storage.getFileLink(req.params.name).then(link => res.redirect(link)).catch(err => res.status(440))
})
router.get('/log', (req, res) => {
    res.download(__dirname + '/log/logs.log')
})

module.exports = router;