var model = require('../models/models');
var request = require('request');
var csv = require('papaparse');
var common = require('./common');


module.exports.portfolio = function(req, res) {

    // When users get to here, they are already verified by Passport
    // Which means the req.session.portfolios are set
    var custom = {
        title: 'Smartfolio - Portfolio'
    };

    // Therefore, do not need this check. But for good measure
    if (req.user) {
        custom.isLoggedIn = true;
        custom.ids = req.session.portfolios.ids;
        custom.count = req.session.portfolios.count;
        custom.username = req.session.user.username;
    } else {
        custom.isLoggedIn = false;
    }

    getAllPortfolios(req, res, renderPortfolio);
};

module.exports.latestPrice = function (req, res) {
    path = 'http://download.finance.yahoo.com/d/quotes.csv?s=' + req.query.ticker + '&f=l1';

    requestOptions = {
        url: path,
        method: "GET",
        json : {}
    };
    request (
        requestOptions,
        function(err, response, body) {
            if (response.statusCode === 200) {
                common.sendJsonResponse(res, 200, body);
            } else {
                throw err;
            }
        }
    );
}