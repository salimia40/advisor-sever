const crypto = require('crypto')

// const key = crypto.randomBytes(32)
// const _iv = crypto.randomBytes(16)

module.exports = (
    _key = '29602cf6385710e2755bd03363409e69d9be60fc28151b1dfeeba3182c9bccc6',
     _iv = '16197ea08999a7d311be2cbc45237ea7',
    // algorithm = 'aes-256-cbc'
) => {
    const algorithm = 'aes-256-cbc'
    const key = Buffer.from(_key, 'hex')
    const iv = Buffer.from(_iv, 'hex')

    function encrypt(text) {
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
        let encrypted = cipher.update(text)
        encrypted = Buffer.concat([encrypted, cipher.final()])
        return encrypted.toString('hex')
    }

    function decrypt(text) {
        let encryptedText = Buffer.from(text, 'hex')
        let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)
        let decrypted = decipher.update(encryptedText)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        return decrypted.toString()
    }

    return {
        encode : function(object) {
            var str = JSON.stringify(object)
            return encrypt(str)
        }
        ,decode : function(str) {
            return JSON.parse(decrypt(str))
        }
    }
}