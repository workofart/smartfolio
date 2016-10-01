// GET analysis page
var renderAnalysis = function(req, res) {
	res.render('analysis', {
		title: 'Smartfolio - Analysis'
	});
};

module.exports.analysis = function(req, res) {
	renderAnalysis(req, res);
};
