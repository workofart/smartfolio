/* GET portfolio page. */
var renderPortfolio = function(req, res) {
  res.render('portfolio', {
  	title: 'Smartfolio - Portfolio'
  });
};

module.exports.portfolio = function(req, res) {
	renderPortfolio(req, res);
};