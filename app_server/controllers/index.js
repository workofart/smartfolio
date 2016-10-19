// GET home page
module.exports.index = function(req, res) {

	var custom = {
		title: 'Smartfolio', 
		Message: req.flash('accessMessage')
	};

	if (req.user) {
		custom.isLoggedIn = true;
	} else {
		custom.isLoggedIn = false;
	}

	console.log(req.session);
	
	res.render('index', custom);
};