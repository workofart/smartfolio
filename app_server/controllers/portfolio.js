var model = require('../models/models');
var request = require('request');

var apiOptions = {
    server: "http://localhost:3000"
};

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

/* GET 'Portfolio details' page */
module.exports.portfolioDetail = function(req, res){
    getPortfolioDetails(req, res, renderDetailPage);
};


var renderDetailPage = function (req, res, data) {
    var custom = {
        title: 'Smartfolio - Portfolio ' + req.params.pid,
        header: 'Portfolio ' + req.params.pid,
        ids: ids,
        pId: data.portfolioid,
        portfolioname: data.portfolioname,
        balance: data.balance,
        userid: data.userid,
        Message: req.flash('accessMessage')
    };

    if (req.user) {
        custom.isLoggedIn = true;
    } else {
        custom.isLoggedIn = false;
    }

    res.render('portfolio_detail', custom);
}

var getPortfolioDetails = function (req, res, callback) {
    // Make get request to api/portfolio/{id}
    var requestOptions, path;
    path = "/api/portfolio/" + req.params.pid;
    requestOptions = {
        url: apiOptions.server + path,
        method: "GET",
        json : {}
    };

    request (
        requestOptions,
        function(err, response, body) {
            var data = body;
            console.log('body: ' + JSON.stringify(data));
            if (response.statusCode === 200) {
                // pass the returned data to res.render
                callback(req, res, data);
            } else {
                throw err;
            }
        }
    );
}
