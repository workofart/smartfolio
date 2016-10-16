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
    var user = getUserObject(req);
    // TODO: need to get userid from somewhere
    if (user != {}){
        model.Portfolios.create({ userid : user.userid , portfolioname : 'BESTportfolio'}).then(
            function (portfolio) {
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
                    return;
                });
            }
        );
    }
    else {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
    }


};

// GET: localhost:3000/api/portfolio
// TODO: Currently only returns the portfolios that are active
module.exports.getAllPortfolios = function (req, res) {
    var user = getUserObject(req);
    if (user != {}) {
        model.Portfolios.findAll({ where: { isactive : 'true' , userid: user.userid }}).then(function (portfolios) {
            sendJsonResponse(res, 200, portfolios);
            return;
        });
    }
    else {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
    }


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
    var user = getUserObject(req);
    if (user != {}) {
        model.Portfolios.update(
            { isactive : "false" },
            { where: {
                portfolioid : req.params.id,
                userid : user.userid
            }
            }).then(function (portfolio) {
                sendJsonResponse(res, 200, portfolio);
                return;
            });
    }
    else {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
    }
}

/**
 * Utility function for getting the current user
 * @param req
 * @returns {*}
 */
function getUserObject (req) {
    if (req.user) {
        var user = req.user.get({
            plain: true
        });
        var userid = user.userid;
        var username = user.username;

        user = {};
        user.userid = userid;
        user.username = username;
        return user;
    }

    return {};
}
