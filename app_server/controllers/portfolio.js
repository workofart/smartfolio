var model = require('../models/models');

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