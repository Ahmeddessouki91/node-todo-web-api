const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.LOCAL_MONGODB_URI);

module.exports = { mongoose };
