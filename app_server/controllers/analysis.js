// GET analysis page
var renderAnalysis = function(req, res) {
	res.render('analysis', {
		title: 'Smartfolio - Analysis'
	});
};

module.exports.analysis = function(req, res) {
	renderAnalysis(req, res);
	writeToFile(portfolio, 'portfolio');
	readFromFile('portfolio');
};



var fs = require('fs');
var storedPortfolio;

var portfolio = {
	pId : 'testVal',
	pName: 'Portfolio2',
	userId: 1
}
var writeToFile = function (data, fileName) {
	fs.writeFile( fileName + '.json', JSON.stringify( data ), "utf8" );
}

var readFromFile = function (fileName) {
	fs.readFile(fileName + '.json', 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}
		storedPortfolio = data;
	});
	console.log(storedPortfolio); // server side console
}
