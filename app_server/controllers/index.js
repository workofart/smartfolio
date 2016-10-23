// GET home page
module.exports.index = function(req, res) {

	var custom = {
		title: 'Smartfolio',
		market_subtitle: 'Research your favourite companies through past \
						  performance and current news to choose your \
						  best pick',
		portfolio_subtitle: 'Manage your portfolios, revisit your past transactions \
							to achieve your strategic goals using our interactive tools',
		insight_subtitle: 'Your best friend - it \
						   will alert you when there\'s an opportunity based \
						   on your risk appetite and many customizable strategies',
		headline: 'The interactive risk-free trading simulator that let\'s\
				   you play with real-time prices and players around the \
				   world',
		Message: req.flash('accessMessage')
	};

	if (req.user) {
		custom.isLoggedIn = true;
		// If req.user is set, then the req.session.portfolios should be set too
		// This is done in controllers/login.js
		custom.ids = req.session.portfolios.ids;
		custom.names = req.session.portfolios.names;
	} else {
		custom.isLoggedIn = false;
	}
	
	res.render('index', custom);
};