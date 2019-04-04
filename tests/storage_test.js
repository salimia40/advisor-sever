const config = require('../server/config')
console.log(require('../server/Storage')(config.storage_bucket,
    config.storage_temp_dir,
    config.storage_keys,
    config.storage_expiry_mimutes
))