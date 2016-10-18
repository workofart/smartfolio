var request = require('request');
var _ = require('underscore');
var moment = require('moment');
var sqlz = require('sequelize');
var connection = require('../../app_server/configs/sequelize');
var model = require('../../app_server/models/models');
var csv = require('papaparse');

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

// POST: localhost:3000/api/portfoliowithstock
module.exports.createPortfolioWithStock = function (req, res) {
    var user = getUserObject(req);
    if (user != {}){
        model.Portfolios.create({ userid : user.userid , portfolioname : req.body.pName}).then(
            function (portfolio) {
                console.log(portfolio);
                model.Transactions.create( {
                    portfolioid: portfolio.get({
                        plain: true
                    }).portfolioid,
                    datetime: moment.tz(moment().format('YYYY/MM/DD HH:mm:ss'), "America/New_York"),
                    ticker: req.body['stocks[ticker]'],
                    quantity: req.body['stocks[quantity]'],
                    price: req.body['stocks[price]']

                }).then(function (transaction) {
                    sendJsonResponse(res, 200, transaction);
                    return;
                });
            }
        );
    }
    else {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
        return;
    }
};

// POST: localhost:3000/api/portfolio
module.exports.createPortfolio = function (req, res) {
    var user = getUserObject(req);
    if (user != {}) {
        model.Portfolios.create({ userid : user.userid, portfolioname : String(req.body.pName)}).then(
            function (portfolio) {
                console.log('created new portfolio: ' + portfolio);
                sendJsonResponse(res, 200, portfolio);
                return;
            });
    }
    else {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
        return;
    }
}

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
        return;
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
        return;
    }
}

// GET: localhost:3000/api/portfolioCount
module.exports.portfolioCount = function (req, res) {
    var user = getUserObject(req);
    if (user != {}) {
        model.Portfolios.count( { where: { isactive : 'true', userid : user.userid}}).then (function (c) {
            sendJsonResponse(res, 200, c);
            return;
        });
    }
    else {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
        return;
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
    else {
        return {};
    }

}


// Not sure if this should be here
// getPortfolioCompositionById
// Example: [{"ticker":"AAPL","portion":"$1,000.00"},
//           {"ticker":"FB","portion":"$3,000.00"},
//           {"ticker":"GOOG","portion":"$2,000.00"}]
module.exports.getPortfolioCompositionById = function (req, res) {
    var user = getUserObject(req);
    // var uid = parseInt(req.params.uid);
    var uid = parseInt(user.userid);
    var pid = parseInt(req.params.pid);

    if (Object.keys(user).length === 0) {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
    } else {

        model.Portfolios.findOne({
            where: { portfolioid: pid }
        }).then(function(result) {
            if (user.userid !== result.dataValues.userid) {
                sendJsonResponse(res, 404, 'Not authorized to perform that action');
            } else {
                query = 'SELECT * FROM public.GetPortfolioCompositionById(:uid, :pid);'
                connection.query(query, 
                    {
                        replacements: {
                            uid: user.userid,
                            pid: pid
                        },
                        type: connection.QueryTypes.SELECT
                    })
                    .then(function(result) {
                        console.log(result);
                        sendJsonResponse(res, 200, result);
                    })
            }
        })
    }
}