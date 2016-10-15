var request = require('request');
var _ = require('underscore');
var moment = require('moment');
var sqlz = require('sequelize');
var connection = require('../../app_server/configs/sequelize');
var model = require('../../app_server/models/models');

var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}

// GET: localhost:3000/api/portfolio/123
module.exports.getPortfolioById = function (req, res){
    model.Portfolios.findById(req.params.id).then(function (portfolio) {
        sendJsonResponse(res, 200, portfolio);
    });
};

// POST: localhost:3000/api/portfolio
module.exports.createPortfolio = function (req, res) {
    // TODO: need to get userid from somewhere
    model.Portfolios.create({ userid : '1', portfolioname : 'BESTportfolio'}).then(
        function (portfolio) {
            // sendJsonResponse(res, 200, portfolio);
            console.log(portfolio);
            model.Transactions.create( {
                portfolioid: portfolio.get({
                    plain: true
                }).portfolioid,
                datetime: moment.tz(moment().format('YYYY/MM/DD HH:mm:ss'), "America/New_York"),
                ticker: req.body['stocks[ticker]'],
                quantity: req.body['stocks[quantity]'],
                price: req.body['stocks[totalAmount]']

            }).then(function (transaction) {
                    sendJsonResponse(res, 200, transaction);
            });
        }
    );

};

// GET: localhost:3000/api/portfolio
// TODO: Currently only returns the portfolios that are active
module.exports.getAllPortfolios = function (req, res) {
    model.Portfolios.findAll({ where: { isactive : 'true' }}).then(function (portfolios) {
        sendJsonResponse(res, 200, portfolios);
    })
};

// PUT: localhost:3000/api/portfolio/1
// TODO: Not yet migrated to db
module.exports.changePortfolioById = function (req, res) {
    var targetPortfolio = findPortfolioById(req.params.id);
    targetPortfolio.pName = req.body.pName;
    targetPortfolio.userId = req.body.userId;
    sendJsonResponse(res, 200, {
        message : "Changed portfolio",
        portfolio: targetPortfolio
    })

}

// DELETE: localhost:3000/api/portfolio/1
module.exports.deletePortfolioById = function (req, res) {
    model.Portfolios.update(
        { isactive : "false" },
        { where: {
            portfolioid : req.params.id
        }
    }).then(
        sendJsonResponse(res, 200, 'success')
    );
}


