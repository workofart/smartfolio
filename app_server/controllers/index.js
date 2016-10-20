// GET home page
module.exports.index = function(req, res) {

	var custom = {
		title: 'Smartfolio', 
		Message: req.flash('accessMessage')
	};

	if (req.user) {
		custom.isLoggedIn = true;
		// If req.user is set, then the req.session.portfolios should be set too
		// This is done in controllers/login.js
		custom.ids = req.session.portfolios.ids;
	} else {
		custom.isLoggedIn = false;
	}
	
	res.render('index', custom);
};