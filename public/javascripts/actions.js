// Get companyList JSON
var ticker = [];
var companyName = [];

var companyList = $.ajax({
		url: '/javascripts/companyList.json',
		type: 'GET',
	})
	.done(function(data) {
		console.log('done~!');
		// console.log(data[0]);
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
			data: companyName
		});
		$("#searchBox2").select2({
			data: ticker
		});
		return data;
	})

var searchQuoteName = function() {
	// console.log(companyName[$("#searchBox").val()].text);
	var selectedTicker = ticker[$("#searchBox").val()].text;
	$('#searchBox2').select2('val', '');
	googleQuote(selectedTicker, 86400, '3d');
}

var searchQuoteTicker = function() {
	// console.log(ticker[$("#searchBox2").val()].text)
	var selectedTicker = ticker[$("#searchBox2").val()].text;
	$('#searchBox').select2('val', '');
	googleQuote(selectedTicker, 86400, '3d');	
}

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
			console.log('google GET call done');
			console.log('=====================');
			// console.log('http://www.google.com/finance/getprices?q=' + ticker + '&x=NASD&i=' + interval + '&p=' + period + '&f=d,c,v,k,o,h,l&df=cpct');
			data = data.split('\n');
			// console.log(data[7].split(',')[0].replace('a', ''));
			dateTime = moment.unix(data[7].split(',')[0].replace('a', ''));
			var temp = data.slice(8, -1);
			temp = convertToQuote(temp, 'days', interval, dateTime);
			// console.log(temp);
			clearTable();
			addChildren(temp, ticker);
			// var result = JSON.parse(data)[0];
			// console.log('Result: ' + result.id);
			// return result;
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
	// var origin; // fixed for basis of offsetting
	for (var i = 0; i < quoteArray.length; i++) {
		var offset = quoteArray[i].split(',')[0];
		// origin = time; // reset the origin
		// console.log('time: ' + time);
		var newDate = time.clone().add(offset, intervalText);
		var newDateStr = newDate.format("dddd, MMMM Do YYYY, h:mm:ss a");
		quote.push({
			date: newDateStr,
			close: quoteArray[i].split(',')[1],
			high: quoteArray[i].split(',')[2],
			low: quoteArray[i].split(',')[3],
			open: quoteArray[i].split(',')[4],
			volume: quoteArray[i].split(',')[5]
		});
	}
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