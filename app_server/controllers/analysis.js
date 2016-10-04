// GET analysis page
var renderAnalysis = function(req, res) {
	res.render('analysis', {
		title: 'Smartfolio - Analysis'
	});
};

module.exports.analysis = function(req, res) {
	renderAnalysis(req, res);
};



var fs = require('fs');
var testJSON = {
	key : 'testVal'
}
module.exports.download = function(req, res) {
	fs.writeFile( "filename.json", JSON.stringify( testJSON ), "utf8" );
}

module.exports.readFile = function (req, res) {
	var myJson = fs.readFile('./filename.json', 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}
		console.log(data);
	});
}
