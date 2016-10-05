var techanSite = techanSite || {};


// Get companyList JSON
var ticker = [];
var companyName = [];

var companyList = $.ajax({
		url: '/javascripts/companyList.json',
		type: 'GET',
	})
	.done(function(data) {
		console.log('done~!');
		// Select2 placeholder requires an empty option 
		$("#searchBox").append($("<option>"));
		$("#searchBox2").append($("<option>"));
		for (var i = 0; i < data.length; i++) {
			ticker.push({
				id: i,
				text: data[i].ticker
			});
			companyName.push({
				id: i,
				text: data[i].companyName
			});
		}
		$("#searchBox").select2({
			// Placeholder defined in Jade file apparently doesn't work
			placeholder: "Company Name",
			data: companyName
		});
		$("#searchBox2").select2({
			placeholder: "Ticker",
			data: ticker
		});
		return data;
	})

var searchQuoteName = function() {
	// console.log(companyName[$("#searchBox").val()].text);
	var selectedTicker = ticker[$("#searchBox").val()].text;
	$('#searchBox2').select2('val', '');
	googleQuote(selectedTicker, 86400, '1Y');


}

var searchQuoteTicker = function() {
	// console.log(ticker[$("#searchBox2").val()].text)
	var selectedTicker = ticker[$("#searchBox2").val()].text;
	$('#searchBox').select2('val', '');
	googleQuote(selectedTicker, 86400, '1Y');	
}

// Link selection boxes
$("#searchBox").on("select2:select", function() {
	var index = $("#searchBox").val();
	var $box2 = $("#searchBox2").select2();
	$box2.val(index).trigger("change");
});

$("#searchBox2").on("select2:select", function() {
	var index = $("#searchBox2").val();
	var $box = $("#searchBox").select2();
	$box.val(index).trigger("change");
});

// Begin combined-chart
(function(window, d3, techanSite) {
	d3.select('div#bigChart').call(techanSite.bigchart);
	window.onresize = function() {
		d3.select('div#bigChart').call(techanSite.bigchart.resize);
	};
})(window, d3, techanSite);

// Configure yahoo finance ajax calls
// Populate the table with data
var googleQuote = function(ticker, interval, period) {
	$.ajax({
			url: 'https://www.google.com/finance/getprices?q=' + ticker + '&x=NASD&i=' + interval + '&p=' + period + '&f=d,c,v,k,o,h,l&df=cpct',
			type: 'GET'
				// contentType: 'application/x-www-form-urlencoded'
		})
		.done(function(data) {
			var dateTime;
			clearTable();
			console.log('google GET call done');
			console.log('=====================');
			// console.log('http://www.google.com/finance/getprices?q=' + ticker + '&x=NASD&i=' + interval + '&p=' + period + '&f=d,c,v,k,o,h,l&df=cpct');

			// split by new line
			data = data.split('\n');
			var quote;
			// replace all unix time
			for (var i = 7; i < data.length - 1; i++) {
				var entries = data[i].split(',');
				entries[0] = entries[0].replace('a', '');
				if (entries[0].includes('TIMEZONE_OFFSET')) {
					continue;
				}
				// check if the line is a new time stamp
				if (entries[0].length > 4) {
					var dateTime = moment.unix(entries[0]);
					quote = convertToQuote(entries, 'days', interval);
					// console.log('i = ' + i + ' | unixtime');
				}
				else {
					// console.log('i = ' + i + ' | offset');
					quote = convertToQuote(entries, 'days', interval, dateTime);
				}


				// console.log('finished ' + i);
				
				addChildren(quote, ticker);
			}
			// get the latest price and fill the form
			var str = quote[0].close;
			$('#latestPrice').text('$' + str);
			// var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(str);
			// var link = document.getElementById('link').href = dataUri;
		})
		.fail(function() {
			console.log("google GET call error");
		});
}

// function convertToTime(unixTime) {
// 	var newTime;
// 	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// 	var date = new Date(unixTime * 1000);
// 	var year = date.getFullYear();
// 	var month = months[date.getMonth()];
// 	var day = date.getDate();
// 	var hours = date.getHours();
// 	var minutes = '0' + date.getMinutes();
// 	var seconds = '0' + date.getSeconds();
// 	newTime = month + ' ' + day + ' ' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
// 	// console.log(date);
// 	return date;
// }

function convertToQuote(quoteArray, intervalText, interval, time) {
	var quote = []; // create quote object
	var offset = quoteArray[0];
	console.log('offset: ' + offset);
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
	});
	return quote;
}

function addChildren(quote, ticker) {
	for (var i = 0; i < quote.length; i++) {
		var tr = document.createElement("tr");
		tr.appendChild(createTdNode(quote[i].date));
		tr.appendChild(createTdNode(ticker));
		// console.log($("#searchBox").val());
		if ($("#searchBox").val() == ''){
			var temp = companyName[$("#searchBox2").val()].text;
			// console.log('searchbox2:');
			// console.log(companyName[$("#searchBox2").val()].text);
		}
		else {
			var temp = companyName[$("#searchBox").val()].text
			// console.log('searchbox: ');
			// console.log(companyName[$("#searchBox").val()].text);
		}
		console.log(temp);
		tr.appendChild(createTdNode(temp));
		tr.appendChild(createTdNode(quote[i].open));
		tr.appendChild(createTdNode(quote[i].close));
		tr.appendChild(createTdNode(quote[i].high));
		tr.appendChild(createTdNode(quote[i].low));
		tr.appendChild(createTdNode(quote[i].volume));
		$("#quoteBody").append(tr);
		console.log("added row: " + (i + 1));
	}
}

function createTdNode(value) {
	var td = document.createElement("td");
	td.innerHTML = value;
	return td;
}

function clearTable() {
	$('#quoteBody').children().each(function() {
		if ($(this).attr('id') != 'header') {
			$(this).remove();
			// console.log('Removed ' + $(this));
		}
	})
}

// auto fill the add to portfolio fields
function fillAddToPortfolioForm() {
	if (ticker[$("#searchBox").val()] != null){
		$('#tickerInput').val(ticker[$("#searchBox").val()].text);
		console.log('Found ticker: ' + ticker[$("#searchBox").val()].text);
	}
}

// Utility function
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// calculates the total dollar amount based on the latest price and quantity entered by user
function getTotalAmount() {
	var latestPrice = $('#latestPrice').text().substr(1);
	var quantity = $('#quantity').val();
	if (isNumber(quantity)) {
		var totalAmount = (Number(latestPrice) * Number(quantity)).toFixed(2);
		$('#totalAmount').text(totalAmount);
	}

}

function addPortfolio() {
	var pId = getPortfolioId();
	var ticker = $('#tickerInput').val();
	var quantity = $('#quantity').val();
	var jsonPortfolio = {
		"pName" : "BestPortfolio",
		"userId" : "100",
		"stock" : {
			"ticker" : ticker,
			"quantity" : quantity
		}
	};
	var portStr = JSON.stringify(jsonPortfolio);
	console.log(portStr);
	$.ajax({
		url: '/api/analysis/' + pId,
		type: 'POST',
		datatype: 'application/json',
		data: jsonPortfolio
	});
}

function getPortfolioId() {
	return 1;
}