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

/* stock_daily */
var StockDailyMeta = require('./stockDaily');
var StockDaily = connection.define('stock_daily', StockDailyMeta.attributes, StockDailyMeta.options);
module.exports.StockDaily = StockDaily;

/* companies */
var CompaniesMeta = require('./companies');
var Companies = connection.define('companies', CompaniesMeta.attributes, CompaniesMeta.options);
module.exports.Companies = Companies;