const Liara = require('@liara/sdk'),
    path = require('path'),
    fs = require('fs'),
    log = require('../log/log')

module.exports = (bucketName, temp, storageKeys, expiry) => {

    const tempPath = path.join(__dirname, temp);
    fs.exists(tempPath, exists => {
        if (exists) log.info(`storage tempdir ${temp} exists skipping`)
        else {
            fs.mkdir(tempPath, err => {
                if (err) throw err
                else log.info(`storage tempdir ${temp} created`)
            });
        }
    });

    const liaraClient = new Liara.Storage.Client(storageKeys);

    liaraClient.bucketExists(bucketName).then(exists => {
        if (exists) log.info(`bucket ${bucketName} exists skipping`)
        if (!exists)
            liaraClient.makeBucket(bucketName).then(res => {
                log.info(`bucket ${bucketName} created: ${res}`)
            }).catch(err => {
                log.info(`bucket ${bucketName} creation error: ${err}`)
            })
    }).catch(err => {
        log.info(`retriving bucket ${bucketName} error: ${err}`)
    })

    return {
        saveFile: (name) => {
            let filepath = path.join(tempPath, name)
            let file = fs.createReadStream(filepath)
            liaraClient.putObject(bucketName, name, file).then((res) => {
                log.info(`stored file ${name} in ${bucketName}: ${res}`)
                fs.unlink(filepath, err => {
                    if (err) log.info(`deleting temp file ${name} error: ${err}`)
                })
            }).catch(err => {
                log.info(`storing file ${name} in ${bucketName} error: ${err}`)
            })
        },
        getFileLink: (name) => liaraClient.presignedGetObject(bucketName, name, expiry * 60),
        tempDir: tempPath
    }
}