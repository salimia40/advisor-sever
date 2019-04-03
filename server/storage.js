const Liara = require('@liara/sdk'),
    path = require('path'),
    fs = require('fs')

module.exports = (bucketName = 'sasshi-v1', temp = '/../uploads') => {

    const tempPath = path.join(__dirname, temp);
    fs.exists(tempPath, exists => {
        if (!exists) {
            fs.mkdir(tempPath, err => {
                if (err) throw err
            });
        }
    });

    const liaraClient = new Liara.Storage.Client({
        accessKey: 'V8EJ6EE9BMFCPAOVM591N',
        secretKey: 'KRcudfW1OcsAFm0XKfnXRpbtDTawJXKp78FBrHuFm',
        endPoint: '5c7e9229e5fa49001752fc27.storage.liara.ir',
    });

    liaraClient.bucketExists(bucketName).then(exists => {
        console.log(exists)
        if (!exists)
            liaraClient.makeBucket(bucketName).then(res => {
                // console.log(res)
            }).catch(err => {
                console.log(err, 28)
            })
    }).catch(err => {
        console.log(err, 29)
    })

    return {
        saveFile: (name) => {
            let filepath = path.join(tempPath, name)
            let file = fs.createReadStream(filepath)
            liaraClient.putObject(bucketName, name, file).then((res) => fs.unlink(filepath, err => {
                if (err) err => {
                    console.log(err, 35)
                }
            })).catch(err => {
                console.log(err, 36)
            })
        },
        getFileLink: (name) => liaraClient.presignedGetObject(bucketName, name, 24 * 60 * 60),
        tempDir: tempPath
    }
}