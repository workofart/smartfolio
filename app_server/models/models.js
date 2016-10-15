var connection = require('../configs/sequelize.js');

/* Portfolios */
var UserMeta = require('./users');
var Users = connection.define('users', UserMeta.attributes, UserMeta.options);
module.exports.Users = Users;


/* Portfolio */
var PortfolioMeta = require('./portfolio');
var Portfolios = connection.define('portfolios', PortfolioMeta.attributes, PortfolioMeta.options);
module.exports.Portfolios = Portfolios;

/* Transaction */
var TransactionMeta = require('./transaction');
var Transactions = connection.define('transactions', TransactionMeta.attributes, TransactionMeta.options);
module.exports.Transactions = Transactions;