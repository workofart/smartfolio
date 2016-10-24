// GET market page
var request = require("request");
var moment = require("moment");
var async = require("async");
var http = require('http');
var model = require('../models/models');
var rsj = require('rsj');

var renderMarket = function(req, res) {

	var custom = {
		title: 'Smartfolio', 
		Message: req.flash('accessMessage')
	};

	if (req.user) {
		custom.isLoggedIn = true;
		custom.ids = req.session.portfolios.ids;
		custom.names = req.session.portfolios.names;
	} else {
		custom.isLoggedIn = false;
	}

	res.render('market', custom);
};

module.exports.market = function(req, res) {
	renderMarket(req, res);
};

var StoredQuotes = {};

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
		var newDateStr = newDate.toDate();
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

	/* FIXME: Need to add ways to remove quotes from memory, otherwise quotes would never update */
	if (ticker in StoredQuotes) {
		console.log("Getting " + ticker + " data from memory");
		res.send(StoredQuotes[ticker]);
	} else {
		console.log("Getting " + ticker + " data from Google");
		getQuotesInArray(ticker, interval, period);
	}
}

// https://developers.google.com/feed/v1/jsondevguide
// Keep this in here? Or move to client?
var YahooNews = {};
module.exports.GetYahooFinanceNews = function(req, res) {

	var ticker = req.query.ticker;
	var num = 10;

	function getNewsRSSInJson(ticker, num) {

		var yahooFeedUrl;
		if (!ticker) {
			yahooFeedUrl = "https://finance.yahoo.com/rss/topfinstories";
		} else {
			yahooFeedUrl = "https://finance.yahoo.com/rss/industry?s=" + ticker;
		}

		// Commented out because Google feed api will be deprecated on Dec 16 2016
		/*
		request(
			{
				uri: 'https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&num=' + num + '&q=' + yahooFeedUrl,
				method: "GET"
			},
			function(error, respone, data) {
				if (!ticker) {
					YahooNews["top"] = data;
					console.log(data);
				} else {
					YahooNews[ticker] = data;
				}
				res.send(data);
			}
		);
		*/

		// Commented out because rss2json has a limit on URL
		// request(
		// 	{
		// 		uri: 'http://rss2json.com/api.json?rss_url=' + yahooFeedUrl,
		// 		method: "GET"
		// 	},
		// 	function(error, respone, data) {
		// 		if (!ticker) {
		// 			YahooNews["top"] = data;
		// 		} else {
		// 			YahooNews[ticker] = data;
		// 		}
		// 		res.send(data);
		// 	}
		// );

		// Internal parser
		// If timeout occurs, it's on Yahoo
		rsj.r2j(yahooFeedUrl, function(json) {
			
			// FIXME: json is a string, the goal is to check if there are news
			// If json is more than 100 characters, then should have feed
			if (json.length >= 100) {
				if (!ticker) {
					YahooNews["top"] = json;
				} else {
					YahooNews[ticker] = json;
				}
			}
			res.send(json);
		})
	}

	/* FIXME: Need to add ways to remove feeds from memory, otherwise news would never update */
	if (ticker in YahooNews) {
		console.log("Returning stored ticker news");
		res.send(YahooNews[ticker]);
	} else if (!ticker && "top" in YahooNews) {
		console.log("Returning stored top news");
		res.send(YahooNews["top"]);
	} else {
		console.log("Returning live news");
		getNewsRSSInJson(ticker, num);
	}
}

// Get companies from database
module.exports.GetCompanyList = function(req, res) {
	model.Companies.findAll({
		order: 'companyid'
	}).then(function(companies) {
		res.send(companies);
	})
}