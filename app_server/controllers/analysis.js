// GET analysis page
var request = require("request");
var moment = require("moment");
var async = require("async");

var renderAnalysis = function(req, res) {
	res.render('analysis', {
		title: 'Smartfolio - Analysis'
	});
};

module.exports.analysis = function(req, res) {
	renderAnalysis(req, res);
};

var StoredQuotes = {};

module.exports.test2 = function(req, res) {
	/*
	request(
		'https://www.google.com/finance/getprices?q=FB&x=NASD&i=86400&p=1Y&f=d,c,v,k,o,h,l&df=cpct', 
		function(error, response, body) {
			// body is the decompressed response body
			console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
			console.log('the decoded data is: ' + body)
		})
		.on("data", function(data) {
			// decompressed data as it is received
    		console.log('decoded chunk: ' + data)
		})
		.on('response', function(response) {
			// unmodified http.IncomingMessage object
			response.on('data', function(data) {
				// compressed data as it is received
				console.log('received ' + data.length + ' bytes of compressed data')
			})
		});
	*/
	var ticker = req.query.ticker;
	var interval = req.query.interval;
	var period = req.query.period;

	request(
		{
			uri: 'https://www.google.com/finance/getprices?q=' + ticker + '&x=NASD&i=' + interval + '&p=' + period + '&f=d,c,v,k,o,h,l&df=cpct',
			method: "GET"
		}, 
		function(error, response, data) {
			res.json(data);
		});
	
}

module.exports.GetGoogleFinanceData = function(req, res) {
	
	var ticker = req.query.ticker;
	var interval = req.query.interval;
	var period = req.query.period;

	function getQuotesInArray(ticker, interval, period) {
		request(
			{
				uri: 'https://www.google.com/finance/getprices?q=' + ticker + '&x=NASD&i=' + interval + '&p=' + period + '&f=d,c,v,k,o,h,l&df=cpct',
				method: "GET"
			}, 
			function(error, response, data) {
				// split by new line
				data = data.split('\n');
				var quoteData = [];
				// replace all unix time
				for (var i = 7; i < data.length - 1; i++) {
					var entries = data[i].split(',');
					var quote;
					entries[0] = entries[0].replace('a', '');
					if (entries[0].includes('TIMEZONE_OFFSET')) {
						continue;
					}
					// check if the line is a new time stamp
					if (entries[0].length > 4) {
						var dateTime = moment.unix(entries[0]);
						quote = convertToQuote(entries, 'days', interval);
						quoteData.push(quote[0]);
					}
					else {
						quote = convertToQuote(entries, 'days', interval, dateTime);
						quoteData.push(quote[0]);
					}
				}
				
				StoredQuotes[ticker] = quoteData;
				res.send(StoredQuotes[ticker]);
			});
	}

	function convertToQuote(quoteArray, intervalText, interval, time) {
		// Returns array of dictionary
		var quote = []; // create quote object
		var offset = quoteArray[0];
		// if true, then we are in the offset section
		if (Number(offset) > 9999) {
			var newDate = moment.unix(offset); // the offset is actually an unix time
		}
		else {
			var newDate = time.clone().add(offset, intervalText);		
		}
		var newDateStr = newDate.format("dddd, MMMM Do YYYY, h:mm:ss a");
		quote.push({
			date: newDateStr,
			close: quoteArray[1],
			high: quoteArray[2],
			low: quoteArray[3],
			open: quoteArray[4],
			volume: quoteArray[5]
		})
		return quote;
	}

	if (ticker in StoredQuotes) {
		console.log("Getting " + ticker + " data from memory");
		res.send(StoredQuotes[ticker]);
	} else {
		console.log("Getting " + ticker + " data from Google");
		getQuotesInArray(ticker, interval, period);
	}
}