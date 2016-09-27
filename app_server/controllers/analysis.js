
// GET analysis page
module.exports.analysis = function(req, res) {

	res.render('analysis', {
		title: 'Smartfolio - analysis',
		// ticker: temp.l,
		// lastPrice: temp.l,
		// exchange: temp.e
	});

	// console.log(ticker);
};