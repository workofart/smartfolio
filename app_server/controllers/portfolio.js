var model = require('../models/models');
var request = require('request');

var apiOptions = {
    server: "http://localhost:3000"
};

/* GET portfolio page. */
var renderPortfolio = function(req, res) {
  res.render('portfolio', {
  	title: 'Smartfolio - Portfolio',
      ids: ids
  });
};

module.exports.portfolio = function(req, res) {
    getAllPortfolios(req, res, renderPortfolio);
};


var ids = [];
function getAllPortfolios(req, res, callback) {
    model.Portfolios.findAll({ where: { isactive : 'true' }}).then(function (portfolios) {
        ids = [];
        for (var i = 0; i < portfolios.length; i++){
            ids.push(portfolios[i].get({
                plain: true
            }).portfolioid);
        }
        callback(req, res);
    });

}

/* GET 'Portfolio details' page */
module.exports.portfolioDetail = function(req, res){
    renderDetailPage(req, res);
};


var renderDetailPage = function (req, res) {
    res.render('portfolio_detail', {
        title: 'Smartfolio - Portfolio' + req.params.pid,
        pId: req.params.pid,
        header: 'Portfolio ' + req.params.pid,
        ids: ids
    })
}

// var getPortfolioDetail = function (req, res, callback) {
//     var requestOptions, path;
//     path = "/api/portfolio/" + req.params.pid;
//     requestOptions = {
//         url: apiOptions.server + path,
//         method: "GET",
//         json : {}
//     };
//     request (
//         requestOptions,
//         function(err, response, body) {
//             var data = body;
//             if (response.statusCode === 200) {
//                 data.coords = {
//                     lng: body.coords[0],
//                     lat: body.coords[1]
//                 };
//                 callback(req, res, data);
//             } else {
//                 _showError(req, res, response.statusCode);
//             }
//         }
//     );
// };