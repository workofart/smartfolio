var UserMeta = require('./users.js');
var connection = require('../configs/sequelize.js');

var Users = connection.define('users', UserMeta.attributes, UserMeta.options);

module.exports.Users = Users;