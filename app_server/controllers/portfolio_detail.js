var request = require('request');
var common = require('./common');
var moment = require('moment');

/* GET 'Portfolio details' page */
module.exports.portfolioDetail = function(req, res){
    var requestOptions, path;
    path = "/api/portfolio/" + req.params.pid;
    requestOptions = {
        url: common.apiOptions.server + path,
        method: "GET",
        json : {}
    };

    var custom = {
        title: 'Smartfolio - Portfolio ' + req.params.pid,
        header: 'Portfolio ' + req.params.pid,
        ids: req.session.portfolios.ids,
        names: req.session.portfolios.names,
        Message: req.flash('accessMessage')
    };

    // If req.user is not set, then cannot make the following GET request anyway
    if (req.user) {
        custom.isLoggedIn = true;
    } else {
        custom.isLoggedIn = false;
    }

    request (
        requestOptions,
        function(err, response, body) {
            var data = body;
            console.log('body: ' + JSON.stringify(data));
            if (response.statusCode === 200) {
                // pass the returned data to res.render
                custom.pId = data.portfolioid;
                custom.portfolioname = data.portfolioname;
                custom.balance = data.balance;
                custom.userid = data.userid;

            } else {
                // FIXME: should handle rather than crash
                throw err;
            }
        }
    );

    request ({
        uri: common.apiOptions.server + '/api/transaction/' + req.params.pid,
        method: 'GET',
        json: {}
    }, function (err, response, body) {
        if (response.statusCode === 200) {
            custom.transactions = body;
            res.render('portfolio_detail', custom);
        } else {
            // FIXME: should handle rather than crash
            throw err;
        }

    });
};