var request = require('request');
require('./common');

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