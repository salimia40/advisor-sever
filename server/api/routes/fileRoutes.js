const
    uuid = require("uuid"),
    fileUpload = require("express-fileupload"),
    log = require("../../log"),
    path = require('path'),
    config = require('../../config'),
    storage = require('../../storage')(
        config.storage_bucket,
        config.storage_temp_dir,
        config.storage_keys
    );

module.exports = (router) => {

    router.use(fileUpload({
        useTempFiles: true,
        tempFileDir: './tmp/'
    }));

    const uploadPath = storage.tempDir;

    /** 
     * @post     /upload     link upload a file to server
     * @param    file        file to upload
     */

    router.route('/upload').post((req, res) => {

        /** @namespace req.files */
        if (Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        let file = req.files.file;
        if(file == undefined) {
            res.json({
                success: false,
                name: null
            })
            return
        }
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

    /**
     * generates a uniq name for file
     */
    const Name = (file) => uuid() + path.extname(file.name)

    /**
     * returns file from storage to be downloaded
     * @get /files/* to download files
     */
    router.route('/files/:name')
        .get((req, res) => {
            storage.getFileLink(req.params.name).then(link => res.redirect(link)).catch(err => res.status(440))
        })

    /**
     * shows the log file
     */
    router.route('/log')
        .get((req, res) => {
            res.download(__dirname + '/../../log/logs.log')
        })


}