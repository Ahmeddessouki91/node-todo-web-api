var config = require('./config.json');

var env = "development";
var envConfig = config[env];

Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
});