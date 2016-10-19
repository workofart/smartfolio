var model = require('../models/models');
var request = require('request');
var csv = require('papaparse');
require('./common');


/* GET portfolio page. */
var renderPortfolio = function(req, res) {
    var user = req.user.get({
        plain: true
    });
    var userid = user.userid;
    var username = user.username;

    var custom = {
        title: 'Smartfolio - Portfolio',
        ids: ids,
        count: totalPortfolios,
        username: username
    };

    if (req.user) {
        custom.isLoggedIn = true;
    } else {
        custom.isLoggedIn = false;
    }

    res.render('portfolio', custom);

};

module.exports.portfolio = function(req, res) {
    getAllPortfolios(req, res, renderPortfolio);
};


var ids = [];
var totalPortfolios = 0;
function getAllPortfolios(req, res, callback) {
    var user = req.user.get({
        plain: true
    });
    var userid = user.userid;
    var username = user.username;

    model.Portfolios.findAll({ where: { isactive : 'true', userid : userid }}).then(function (portfolios) {
        ids = [];
        for (var i = 0; i < portfolios.length; i++){
            ids.push(portfolios[i].get({
                plain: true
            }).portfolioid);
        }
        model.Portfolios.count( { where: { isactive : 'true', userid : userid }}).then (function (c) {
            console.log('Count: ' + c);
            totalPortfolios = c;
            callback(req, res);
        });
    });
}

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
                sendJsonResponse(res, 200, body);
            } else {
                throw err;
            }
        }
    );
}