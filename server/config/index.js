process.env.NODE_ENV = 'production';

/**
 * reads config from json file 
 */
readConfig = () => {
    const log = require('../log')
    const config = require('./config.json');
    const defaultConfig = config.development;
    const environment = process.env.NODE_ENV || 'development';
    const environmentConfig = config[environment];
    log.info(`runing server in ${environment} environment`)
    const finalConfig = Object.assign(defaultConfig, environmentConfig)
    return finalConfig;
}
/**
 * exposes the config to rest of app
 */
buildConfig = (config) => {
    var c = {};
    switch (config.config_id) {
        case "production":
            c.db_url = `mongodb://${config.database_user}:${config.database_pass}@${config.database_host}:${config.database_port}/${config.database_name}`
            break;
        case "testing":
        case "development":
        default:
            c.db_url = `mongodb://${config.database_host}:${config.database_port}/${config.database_name}`
            break;
    }
    
    c.storage_bucket = config.storage_bucket
    c.storage_temp_dir = config.storage_temp_dir
    c.storage_expiry_mimutes = config.storage_bucket
    c.storage_keys = config.storage_keys
    c.port = config.node_port
    c.mail = config.mail
    return c;
    
}

module.exports = buildConfig(readConfig());