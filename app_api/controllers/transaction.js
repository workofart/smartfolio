var sqlz = require('sequelize');
var connection = require('../../app_server/configs/sequelize');
var model = require('../../app_server/models/models');
var moment = require('moment');

var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}

// For avoiding the deprecation warning for moment
moment.createFromInputFallback = function(config) {
    // unreliable string magic, or
    config._d = new Date(config._i);
};

module.exports.buyStock = function (req, res) {
    // Get balance from portfolio
    model.Portfolios.findOne({
        where: {
            portfolioid: req.params.id,
        }
    }).then(function(portfolio) {
        if (portfolio.balance >= req.body.quantity * req.body.price) {
            // Proceed with transaction
            model.Transactions.create( {
                portfolioid: req.params.id,
                datetime: moment.parseZone(moment().format('YYYY/MM/DD HH:mm:ss')),
                ticker: req.body.ticker,
                quantity: req.body.quantity,
                price: req.body.price,
                status: 1 // FIXME: order should be filled later
            }).then(function (transaction) {
                sendJsonResponse(res, 200, 'Success');
            });
        } else {
            sendJsonResponse(res, 400, 'Insufficient funds to make transaction')
        }
    })
}

module.exports.sellStock = function (req, res) {
    model.Transactions.create( {
        portfolioid: req.params.id,
        datetime: moment.parseZone(moment().format('YYYY/MM/DD HH:mm:ss')),
        ticker: req.body.ticker,
        quantity: -req.body.quantity,
        price: req.body.price,
        status: 1

    }).then(function (transaction) {
        sendJsonResponse(res, 200, 'Success');
    });
}

module.exports.getTransactions = function (req, res) {
    model.Transactions.findAll( {where: { portfolioid: req.params.id }}).then(function (transactions) {
        sendJsonResponse(res, 200, transactions);
    });
}

module.exports.getAllTransactions = function (req, res) {
    model.Transactions.findAll().then(function (transactions) {
        sendJsonResponse(res, 200, transactions);
    });
}

