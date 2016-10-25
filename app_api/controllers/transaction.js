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
            // Get Position from latest transaction
            model.Transactions.findOne({
                where: {
                    portfolioid: req.params.id,
                    ticker: req.body.ticker
                },
                order: 'transactionid DESC'
            }).then(function(lastTransaction) {
                // Update portfolio balance
                var currentBalance = portfolio.balance;
                portfolio.updateAttributes({
                    balance: parseFloat(currentBalance) - (parseFloat(req.body.quantity) * parseFloat(req.body.price))
                });

                if (!lastTransaction) {
                    // No previous transaction, create away
                    model.Transactions.create( {
                        portfolioid: req.params.id,
                        datetime: moment.parseZone(moment().format('YYYY/MM/DD HH:mm:ss')),
                        ticker: req.body.ticker,
                        quantity: req.body.quantity,
                        position: req.body.quantity,
                        price: req.body.price,
                        status: 1 // FIXME: order should be filled later
                    }).then(function (transaction) {
                        sendJsonResponse(res, 200, 'Success');
                    });
                } else {
                    // Has previous transaction with same ticker
                    model.Transactions.create( {
                        portfolioid: req.params.id,
                        datetime: moment.parseZone(moment().format('YYYY/MM/DD HH:mm:ss')),
                        ticker: req.body.ticker,
                        quantity: req.body.quantity,
                        position: parseFloat(lastTransaction.position) + parseFloat(req.body.quantity),
                        price: req.body.price,
                        status: 1 // FIXME: order should be filled later
                    }).then(function (transaction) {
                        sendJsonResponse(res, 200, 'Success');
                    });
                }
            })
        } else {
            sendJsonResponse(res, 400, 'Insufficient funds to make transaction');
        }
    })
}

module.exports.sellStock = function (req, res) {
    // Need to check for current position, to make sure have enough stock to sell
    model.Transactions.findOne({
        where: {
            portfolioid: req.params.id,
            ticker: req.body.ticker
        },
        order: 'transactionid DESC'
    }).then(function(lastTransaction) {
        if (!lastTransaction || parseFloat(lastTransaction.position) < parseFloat(req.body.quantity)) {
            // No previous transaction, i.e. no Position, reject straight away
            // Or current position is less than sell order quantity
            sendJsonResponse(res, 400, 'Insufficient stock holdings to make sell order');
        } else {
            // Enough stocks to make order
            model.Transactions.create({
                portfolioid: req.params.id,
                datetime: moment.parseZone(moment().format('YYYY/MM/DD HH:mm:ss')),
                ticker: req.body.ticker,
                quantity: -req.body.quantity,
                position: lastTransaction.position - req.body.quantity, 
                price: req.body.price,
                status: 1 // FIXME: order should be filled later
            }).then(function (transaction) {
                // Also need to update balance in portfolio
                model.Portfolios.findOne({
                    where: {
                        portfolioid: req.params.id,
                    }
                }).then(function(portfolio) {
                    var currentBalance = parseFloat(portfolio.balance);
                    portfolio.updateAttributes({
                        balance: currentBalance + (parseFloat(req.body.quantity) * parseFloat(req.body.price))
                    });
                })

                sendJsonResponse(res, 200, 'Success');
            });
        }        
    })
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

