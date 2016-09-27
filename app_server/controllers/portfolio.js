// GET portfolio page
module.exports.portfolio = function(req, res) {
	res.render('portfolio', {title: 'Smartfolio - portfolio'});
};