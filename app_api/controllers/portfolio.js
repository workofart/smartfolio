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
    var initialReserve = 10000; // TODO: Extract this to somewhere that's reusable
    var user = getUserObject(req);
    console.log('createPortfolioWithStock | ' + JSON.stringify(user));
    console.log('rreq.body: ' + JSON.stringify(req.body));
    if (JSON.stringify(user) != '{}'){
        model.Portfolios.create({ userid : user.userid , portfolioname : req.body.pName}).then(
            function (portfolio) {
                console.log(portfolio);
                req.session.portfolios.count++;
                req.session.portfolios.ids.push(portfolio.portfolioid);
                req.session.portfolios.names.push(portfolio.portfolioname)
                model.Transactions.create( {
                    portfolioid: portfolio.get({
                        plain: true
                    }).portfolioid,
                    datetime: moment.tz(moment().format('YYYY/MM/DD HH:mm:ss'), "America/New_York"),
                    ticker: req.body['stocks[ticker]'],
                    quantity: req.body['stocks[quantity]'],
                    price: req.body['stocks[price]'],
                    position: req.body['stocks[quantity]'],
                    status: 1 // FIXME: order should be filled later
                }).then(function(done) {
                    // Double entry for cash
                    model.Transactions.create( {
                        portfolioid: portfolio.portfolioid,
                        datetime: moment.parseZone(moment().format('YYYY/MM/DD HH:mm:ss')),
                        ticker: 'RESERVE',
                        quantity: 1,
                        position: (initialReserve - (parseFloat(req.body['stocks[quantity]']) * parseFloat(req.body['stocks[price]']))),
                        price: -1 * parseFloat(req.body['stocks[price]']) * req.body['stocks[quantity]'],
                        status: 1 // FIXME: order should be filled later
                    }).then(function (transaction) {
                        sendJsonResponse(res, 200, transaction);
                        return;
                    });
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
    if (JSON.stringify(user) != '{}') {
        model.Portfolios.create({ userid : user.userid, portfolioname : String(req.body.pName)}).then(
            function (portfolio) {
                console.log('created new portfolio: ' + portfolio);
                req.session.portfolios.count++;
                req.session.portfolios.ids.push(portfolio.portfolioid);
                req.session.portfolios.names.push(portfolio.portfolioname);
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
    if (JSON.stringify(user) != '{}') {
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
    if (JSON.stringify(user) != '{}') {
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
    if (JSON.stringify(user) != '{}') {
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

// GET: localhost:3000/api/getPriceListByTicker/ticker
// FIXME: The 'attr' parameter still needs fixing, still getting all columns
module.exports.getPriceListByTicker = function (req, res) {
    console.log(JSON.stringify(req.body));
    var user = getUserObject(req);
    var ticker = req.params.ticker;
    var attr = req.attr;
    // var colList = ['close', 'datetime'];
    console.log('ticker ' + ticker);
    console.log('attr ' + attr);
    if (JSON.stringify(user) != '{}') {
        model.StockDaily.findAll( {
            where: {
                ticker : ticker
            },
            attributes: attr
        }).then(function(c) {
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
    var uid = parseInt(user.userid);
    var pid = parseInt(req.params.pid);

    if (Object.keys(user).length === 0) {
        console.log('getPortfolioCompositionById user is wrong');
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

module.exports.getPortfolioRealValueById = function (req, res) {
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
                query = 'SELECT * FROM public.GetPortfolioRealValueById(:pid);'
                connection.query(query, 
                    {
                        replacements: {
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

module.exports.getPortfolioBookValueById = function (req, res) {
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
                query = 'SELECT * FROM public.GetPortfolioBookValueById(:pid);'
                connection.query(query, 
                    {
                        replacements: {
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

module.exports.getPortfolioBookValueForDateById = function (req, res) {
    var user = getUserObject(req);
    // var uid = parseInt(req.params.uid);
    var uid = parseInt(user.userid);
    var pid = parseInt(req.params.pid);
    var date = new Date(req.params.date);

    if (Object.keys(user).length === 0) {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
    } else {

        model.Portfolios.findOne({
            where: { portfolioid: pid }
        }).then(function(result) {
            if (user.userid !== result.dataValues.userid) {
                sendJsonResponse(res, 404, 'Not authorized to perform that action');
            } else {
                query = 'SELECT * FROM public.GetPortfolioBookValueForDateById(:pid, :date);'
                connection.query(query, 
                    {
                        replacements: {
                            pid: pid,
                            date: date
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

module.exports.getPortfolioBookPerformance = function(req, res) {
    var user = getUserObject(req);
    var uid = parseInt(user.userid);
    var pid = parseInt(req.params.pid);
    // var date = new Date(req.params.date);

    if (Object.keys(user).length === 0) {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
    } else {

        model.Portfolios.findOne({
            where: { portfolioid: pid }
        }).then(function(result) {
            if (user.userid !== result.dataValues.userid) {
                sendJsonResponse(res, 404, 'Not authorized to perform that action');
            } else {


                var num = 52;
                var completed_queries = 0;
                var outResult = [];

                for (var i = 0; i < num; i++) {
                    (function(index) {
                        var date = new Date();
                        date.setDate(date.getDate() - 7 * (num-1));
                        date.setDate(date.getDate() + 7 * i);
                        var datetime = moment(date).format('YYYY-MM-DD');

                        query = 'SELECT * FROM public.GetPortfolioBookValueForDateById(:pid, :date);'
                        connection.query(query, 
                            {
                                replacements: {
                                    pid: pid,
                                    date: new Date(datetime)
                                },
                                type: connection.QueryTypes.SELECT
                            })
                            .then(function(data) {
                                completed_queries++;
                                var total = 0;
                                for (var j = 0; j < data.length; j++) {
                                    total += parseFloat(data[j].value);
                                }
                                outResult.push({ x: index, y: total, date: datetime });
                                
                                if (completed_queries == num) {
                                    sendJsonResponse(res, 200, outResult);
                                }
                            })
                    })(i);
                }
            }
        })
    }
}

module.exports.getPortfolioRealPerformance = function(req, res) {
    var user = getUserObject(req);
    var uid = parseInt(user.userid);
    var pid = parseInt(req.params.pid);
    // var date = new Date(req.params.date);

    if (Object.keys(user).length === 0) {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
    } else {

        model.Portfolios.findOne({
            where: { portfolioid: pid }
        }).then(function(result) {
            if (user.userid !== result.dataValues.userid) {
                sendJsonResponse(res, 404, 'Not authorized to perform that action');
            } else {


                var num = 52;
                var completed_queries = 0;
                var outResult = [];

                for (var i = 0; i < num; i++) {
                    (function(index) {
                        var date = new Date();
                        date.setDate(date.getDate() - 7 * (num-1));
                        date.setDate(date.getDate() + 7 * i);
                        var datetime = moment(date).format('YYYY-MM-DD');

                        query = 'SELECT * FROM public.GetPortfolioRealValueForDateById(:pid, :date);'
                        connection.query(query, 
                            {
                                replacements: {
                                    pid: pid,
                                    date: new Date(datetime)
                                },
                                type: connection.QueryTypes.SELECT
                            })
                            .then(function(data) {
                                completed_queries++;
                                var total = 0;
                                for (var j = 0; j < data.length; j++) {
                                    total += parseFloat(data[j].value);
                                }
                                outResult.push({ x: index, y: total, date: datetime });
                                
                                if (completed_queries == num) {
                                    sendJsonResponse(res, 200, outResult);
                                }
                            })
                    })(i);
                }
            }
        })
    }
}

module.exports.getPortfolioVolume = function(req, res) {
    var user = getUserObject(req);
    var uid = parseInt(user.userid);
    var pid = parseInt(req.params.pid);
    // var date = new Date(req.params.date);

    if (Object.keys(user).length === 0) {
        sendJsonResponse(res, 404, 'Not authorized to perform that action');
    } else {

        model.Portfolios.findOne({
            where: { portfolioid: pid }
        }).then(function(result) {
            if (user.userid !== result.dataValues.userid) {
                sendJsonResponse(res, 404, 'Not authorized to perform that action');
            } else {
                query = 'SELECT * FROM public.GetPortfolioTransactionsVolumneById(:pid);'
                connection.query(query, 
                    {
                        replacements: {
                            pid: pid,
                        },
                        type: connection.QueryTypes.SELECT
                    })
                    .then(function(data) {
                        sendJsonResponse(res, 200, data);
                    })
            }
        })
    }
}