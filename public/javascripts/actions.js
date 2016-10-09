var techanSite = techanSite || {};
var GoogleFinanceData = GoogleFinanceData || {};


// Get companyList JSON
var ticker = [];
var companyName = [];

var companyList = $.ajax({
		url: '/javascripts/companyList.json',
		type: 'GET'
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
	var selectedTicker = ticker[$("#searchBox").val()].text;
	googleQuote(selectedTicker, 86400, '1Y');
}

var searchQuoteTicker = function() {
	var selectedTicker = ticker[$("#searchBox2").val()].text;
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
// (function(window, d3, techanSite) {
// 	d3.select('div#bigChart').call(techanSite.bigchart);
// 	window.onresize = function() {
// 		d3.select('div#bigChart').call(techanSite.bigchart.resize);
// 	};
// })(window, d3, techanSite);

// Function for handling when search button is clicked
var searchQuote = function() {
	var selectedTicker = ticker[$("#searchBox2").val()].text;
	var interval = 86400;
	var period = '1Y';

	var results;

	$.ajax(
		{
			url: "/market/GetGoogleFinanceData?ticker=" + selectedTicker + "&interval=" + interval + "&period=" + period,
			type: "GET"
		})
		.done(function(data) {
			PopulateTable(selectedTicker, data);
			// Clear origin chart and populate
			d3.select('div#bigChart').select("svg").remove();
			d3.select('div#bigChart').call(PopulateChart(data));

			// get the latest price and fill the form
			var str = data[data.length-1].close;
			$('#latestPrice').text('$' + str);
		})

    // Featured news
	$.ajax(
		{
			dataType: "json",
			url: "/market/GetYahooFinanceNews",
			type: "GET" 
		})
		.done(function(data) {
			PopulateNews("#featured-news-list", data);
		})
	
	// Ticker news
	$.ajax(
		{
			dataType: "json",
			url: "/market/GetYahooFinanceNews?ticker=" + selectedTicker,
			type: "GET" 
		})
		.done(function(data) {
			PopulateNews("#ticker-news-list", data);
		})
}

function PopulateNews(listID, data) {
	var length = data["responseData"]["feed"]["entries"].length;
	for (var i = 0; i < length; i++) {
		var entry = data["responseData"]["feed"]["entries"][i];
		var link = '<a href="' + entry.link + '">Read more...</a>'
		var upButton = '<a href="#" class="btn btn-lg btn-default"><span class="glyphicon glyphicon-circle-arrow-up text-success"></span></a>'
		var downButton = '<a href="#" class="btn btn-lg btn-default"><span class="glyphicon glyphicon-circle-arrow-down text-danger"></span></a>'
		$(listID).append('<li class="news-item">' + entry.title + ' ' + link + upButton + downButton + '</li>')
	}
}


function PopulateTable(ticker, data) {
	var company = companyName[$("#searchBox2").val()].text;
	var table = $("#stockQuotes").DataTable({
		retrieve: true,
		autoWidth: false
	});
	table.clear().draw();
	for (var i = 0; i < data.length; i++) {
		var array = [];
		array.push(new Date(data[i].date));
		array.push(ticker);
		array.push(company);
		array.push(data[i].open);
		array.push(data[i].close);
		array.push(data[i].high);
		array.push(data[i].low);
		array.push(data[i].volume);
		table.row.add(array).draw();
	}
}

function PopulateChart(dataQuotes) {
	'use strict';

	function Preprocess(dataQuotes) {
		var PreprocessedData = [];
		for (var i = 0; i < dataQuotes.length; i++) {
			PreprocessedData.push({
				date: new Date(dataQuotes[i].date),
				open: parseFloat(dataQuotes[i].open),
				close: parseFloat(dataQuotes[i].close),
				high: parseFloat(dataQuotes[i].high),
				low: parseFloat(dataQuotes[i].low),
				volume: parseInt(dataQuotes[i].volume)
			});
		}
		return PreprocessedData;
	}

	function BigChart(stock) {
		var dim = {
			width: null, height: null,
			margin: { top: 25, right: 50, bottom: 25, left: 50 },
			plot: { width: null, height: null },
			ohlc: { height: null },
			indicator: { height: null, padding: null, top: null, bottom: null }
		};

		var data = stock.ohlc,
				x = techan.scale.financetime(),
				y = d3.scaleLinear(),
				yPercent = y.copy(),
				indicatorTop = d3.scaleLinear(),
				yVolume = d3.scaleLinear(),
				candlestick = techan.plot.candlestick().xScale(x).yScale(y),
				sma0 = techan.plot.sma().xScale(x).yScale(y),
				sma1 = techan.plot.sma().xScale(x).yScale(y),
				ema2 = techan.plot.ema().xScale(x).yScale(y),
				volume = techan.plot.volume().accessor(candlestick.accessor()).xScale(x).yScale(yVolume),
				xAxis = d3.axisBottom(x),
				xAxisTop = d3.axisTop(x),
				timeAnnotation = techan.plot.axisannotation().orient('bottom').axis(xAxis).format(d3.timeFormat('%Y-%m-%d')).width(65),
				timeAnnotationTop = techan.plot.axisannotation().orient('top').axis(xAxisTop).format(d3.timeFormat('%Y-%m-%d')).width(65),
				yAxis = d3.axisRight(y),
				ohlcAnnotation = techan.plot.axisannotation().orient('right').axis(yAxis).format(d3.format(',.2f')),
				closeAnnotation = techan.plot.axisannotation().orient('right').accessor(candlestick.accessor()).axis(yAxis).format(d3.format(',.2f')),
				percentAxis = d3.axisLeft(yPercent).tickFormat(d3.format('+.1%')),
				percentAnnotation = techan.plot.axisannotation().orient('left').axis(percentAxis),
				volumeAxis = d3.axisRight(yVolume).ticks(3).tickFormat(d3.format(',.3s')),
				volumeAnnotation = techan.plot.axisannotation().orient('right').axis(volumeAxis).width(35),
				macdScale = d3.scaleLinear(),
				rsiScale = d3.scaleLinear(),
				macd = techan.plot.macd().xScale(x).yScale(macdScale),
				macdAxis = d3.axisRight(macdScale).ticks(3),
				macdAnnotation = techan.plot.axisannotation().orient('right').axis(macdAxis).format(d3.format(',.2s')),
				macdAxisLeft = d3.axisLeft(macdScale).ticks(3),
				macdAnnotationLeft = techan.plot.axisannotation().orient('left').axis(macdAxisLeft).format(d3.format(',.2s')),
				rsi = techan.plot.rsi().xScale(x).yScale(rsiScale),
				rsiAxis = d3.axisRight(rsiScale).ticks(3),
				rsiAnnotation = techan.plot.axisannotation().orient('right').axis(rsiAxis).format(d3.format(',.2s')),
				rsiAxisLeft = d3.axisLeft(rsiScale).ticks(3),
				rsiAnnotationLeft = techan.plot.axisannotation().orient('left').axis(rsiAxisLeft).format(d3.format(',.2s')),
				ohlcCrosshair = techan.plot.crosshair().xScale(x).yScale(y).xAnnotation([timeAnnotation, timeAnnotationTop]).yAnnotation([ohlcAnnotation, percentAnnotation, volumeAnnotation]),
				macdCrosshair = techan.plot.crosshair().xScale(x).yScale(macdScale).xAnnotation([timeAnnotation, timeAnnotationTop]).yAnnotation([macdAnnotation, macdAnnotationLeft]),
				rsiCrosshair = techan.plot.crosshair().xScale(x).yScale(rsiScale).xAnnotation([timeAnnotation, timeAnnotationTop]).yAnnotation([rsiAnnotation, rsiAnnotationLeft]),
				trendline = techan.plot.trendline().xScale(x).yScale(y),
				supstance = techan.plot.supstance().xScale(x).yScale(y).annotation([ohlcAnnotation, percentAnnotation]);

		function bigchart(selection) {
			var svg = selection.append("svg"),
					defs = svg.append("defs");

			defs.append("clipPath")
					.attr("id", "ohlcClip")
				.append("rect")
					.attr("x", 0)
					.attr("y", 0);

			defs.append("clipPath")
					.attr("id", "supstanceClip")
				.append("rect")
					.attr("x", -dim.margin.left)
					.attr("y", 0);

			defs.selectAll(".indicatorClip").data([0, 1])
				.enter()
				.append("clipPath")
					.attr("id", function(d, i) { return "indicatorClip-" + i; })
					.attr("class", "indicatorClip")
				.append("rect")
					.attr("x", 0);

			svg.append('text')
					.attr("class", "version")
					.style("text-anchor", "end")
					.text("TechanJS v" + techan.version + ", D3 v" + d3.version);

			svg = svg.append("g")
				.attr("class", "chart")
				.attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

			svg.append('text')
				.attr("class", "symbol")
				.attr("x", 5)
				.attr("y", 15)
				.text(stock.name);

			svg.append("g")
				.attr("class", "x axis bottom");

			svg.append("g")
				.attr("class", "x axis top");

			var ohlcSelection = svg.append("g")
				.attr("class", "ohlc")
				.attr("transform", "translate(0,0)");

			ohlcSelection.append("g")
					.attr("class", "y axis");

			ohlcSelection.append("g")
				.attr("class", "closeValue annotation up");

			ohlcSelection.append("g")
				.attr("class", "volume")
				.attr("clip-path", "url(#ohlcClip)");

			ohlcSelection.append("g")
				.attr("class", "candlestick")
				.attr("clip-path", "url(#ohlcClip)");

			ohlcSelection.append("g")
				.attr("class", "indicator sma ma-0")
				.attr("clip-path", "url(#ohlcClip)");

			ohlcSelection.append("g")
				.attr("class", "indicator sma ma-1")
				.attr("clip-path", "url(#ohlcClip)");

			ohlcSelection.append("g")
				.attr("class", "indicator ema ma-2")
				.attr("clip-path", "url(#ohlcClip)");

			ohlcSelection.append("g")
				.attr("class", "percent axis");

			ohlcSelection.append("g")
				.attr("class", "volume axis");

			var indicatorSelection = svg.selectAll("svg > g.indicator").data(["macd", "rsi"]).enter()
				.append("g")
				.attr("class", function(d) { return d + " indicator"; });

			indicatorSelection.append("g")
				.attr("class", "axis right");

			indicatorSelection.append("g")
				.attr("class", "axis left");

			indicatorSelection.append("g")
				.attr("class", "indicator-plot")
				.attr("clip-path", function(d, i) { return "url(#indicatorClip-" + i + ")"; });

			// Add trendlines and other interactions last to be above zoom pane
			svg.append('g')
				.attr("class", "crosshair ohlc");

			svg.append('g')
				.attr("class", "crosshair macd");

			svg.append('g')
				.attr("class", "crosshair rsi");

			svg.append("g")
				.attr("class", "trendlines analysis")
				.attr("clip-path", "url(#ohlcClip)");
			svg.append("g")
				.attr("class", "supstances analysis");

			var accessor = candlestick.accessor(),
					indicatorPreRoll = stock.preroll,
					postRollData = data.slice(indicatorPreRoll);  // Don't show where indicators don't have data

			x.domain(techan.scale.plot.time(data).domain());
			y.domain(techan.scale.plot.ohlc(postRollData).domain());
			yPercent.domain(techan.scale.plot.percent(y, accessor(data[indicatorPreRoll])).domain());
			yVolume.domain(techan.scale.plot.volume(postRollData).domain());

			var macdData = techan.indicator.macd()(data);
			macdScale.domain(techan.scale.plot.macd(macdData).domain());
			var rsiData = techan.indicator.rsi()(data);
			rsiScale.domain(techan.scale.plot.rsi(rsiData).domain());

			x.zoomable().domain([indicatorPreRoll, data.length]); // Zoom in a little to hide indicator preroll
			resize(selection);

			svg.select("g.candlestick").datum(data).call(candlestick);
			svg.select("g.closeValue.annotation").datum([data[data.length-1]]).call(closeAnnotation);
			svg.select("g.volume").datum(data).call(volume);
			svg.select("g.sma.ma-0").datum(techan.indicator.sma().period(10)(data)).call(sma0);
			svg.select("g.sma.ma-1").datum(techan.indicator.sma().period(20)(data)).call(sma1);
			svg.select("g.ema.ma-2").datum(techan.indicator.ema().period(50)(data)).call(ema2);
			svg.select("g.macd .indicator-plot").datum(macdData).call(macd);
			svg.select("g.rsi .indicator-plot").datum(rsiData).call(rsi);

			svg.select("g.crosshair.ohlc").call(ohlcCrosshair);
			svg.select("g.crosshair.macd").call(macdCrosshair);
			svg.select("g.crosshair.rsi").call(rsiCrosshair);
			//svg.select("g.trendlines").datum(stock.trendlines).call(trendline).call(trendline.drag);
			//svg.select("g.supstances").datum(stock.supstances).call(supstance).call(supstance.drag);

			selection.call(draw);
		}

		bigchart.resize = function(selection) {
			selection.call(resize).call(draw);
		};

		function resize(selection) {
			dim.width = selection.node().clientWidth;
			dim.height = selection.node().clientHeight;
			dim.plot.width = dim.width - dim.margin.left - dim.margin.right;
			dim.plot.height = dim.height - dim.margin.top - dim.margin.bottom;
			dim.ohlc.height = dim.plot.height * 0.67777777;
			dim.indicator.height = dim.plot.height * 0.144444;
			dim.indicator.padding = dim.plot.height * 0.01111111111;
			dim.indicator.top = dim.ohlc.height + dim.indicator.padding;
			dim.indicator.bottom = dim.indicator.top + dim.indicator.height + dim.indicator.padding;

			var xRange = [0, dim.plot.width],
					yRange = [dim.ohlc.height, 0],
					ohlcVerticalTicks = Math.min(10, Math.round(dim.height/70)),
					xTicks = Math.min(10, Math.round(dim.width/130));

			indicatorTop.range([dim.indicator.top, dim.indicator.bottom]);
			x.range(xRange);
			xAxis.ticks(xTicks);
			xAxisTop.ticks(xTicks);
			y.range(yRange);
			yAxis.ticks(ohlcVerticalTicks);
			yPercent.range(y.range());
			percentAxis.ticks(ohlcVerticalTicks);
			yVolume.range([yRange[0], yRange[0]-0.2*yRange[0]]);
			volumeAxis.ticks(Math.min(3, Math.round(dim.height/150)));
			timeAnnotation.translate([0, dim.plot.height]);
			ohlcAnnotation.translate([xRange[1], 0]);
			closeAnnotation.translate([xRange[1], 0]);
			macdScale.range([indicatorTop(0) + dim.indicator.height, indicatorTop(0)]);
			rsiScale.range([indicatorTop(1) + dim.indicator.height, indicatorTop(1)]);
			macdAnnotation.translate([xRange[1], 0]);
			rsiAnnotation.translate([xRange[1], 0]);
			ohlcCrosshair.verticalWireRange([0, dim.plot.height]);
			macdCrosshair.verticalWireRange([0, dim.plot.height]);
			rsiCrosshair.verticalWireRange([0, dim.plot.height]);

			selection.select("svg")
				.attr("width", dim.width)
				.attr("height", dim.height);

			selection.select("text.version")
					.attr("x", dim.width-5)
					.attr("y", dim.height);

			selection.selectAll("defs #ohlcClip > rect")
				.attr("width", dim.plot.width)
				.attr("height", dim.ohlc.height);

			selection.selectAll("defs #supstanceClip > rect")
				.attr("width", dim.width)
				.attr("height", dim.ohlc.height);

			selection.selectAll("defs .indicatorClip > rect")
				.attr("y", function (d, i) {
					return indicatorTop(i);
				})
				.attr("width", dim.plot.width)
				.attr("height", dim.indicator.height);

			selection.select("g.x.axis.bottom")
				.attr("transform", "translate(0," + dim.plot.height + ")");

			selection.select("g.ohlc g.y.axis")
				.attr("transform", "translate(" + xRange[1] + ",0)");

			selection.selectAll("g.indicator g.axis.right")
				.attr("transform", "translate(" + xRange[1] + ",0)");
			selection.selectAll("g.indicator g.axis.left")
				.attr("transform", "translate(" + xRange[0] + ",0)");
		}

		function draw(selection) {
			var svg = selection.select("svg");
			svg.select("g.x.axis.bottom").call(xAxis);
			svg.select("g.x.axis.top").call(xAxisTop);
			svg.select("g.ohlc .axis").call(yAxis);
			svg.select("g.volume.axis").call(volumeAxis);
			svg.select("g.percent.axis").call(percentAxis);
			svg.select("g.macd .axis.right").call(macdAxis);
			svg.select("g.rsi .axis.right").call(rsiAxis);
			svg.select("g.macd .axis.left").call(macdAxisLeft);
			svg.select("g.rsi .axis.left").call(rsiAxisLeft);

			// We know the data does not change, a simple refresh that does not perform data joins will suffice.
			svg.select("g.candlestick").call(candlestick.refresh);
			svg.select("g.closeValue.annotation").call(closeAnnotation.refresh);
			svg.select("g.volume").call(volume.refresh);
			svg.select("g .sma.ma-0").call(sma0.refresh);
			svg.select("g .sma.ma-1").call(sma1.refresh);
			svg.select("g .ema.ma-2").call(ema2.refresh);
			svg.select("g.macd .indicator-plot").call(macd.refresh);
			svg.select("g.rsi .indicator-plot").call(rsi.refresh);
			svg.select("g.crosshair.ohlc").call(ohlcCrosshair.refresh);
			svg.select("g.crosshair.macd").call(macdCrosshair.refresh);
			svg.select("g.crosshair.rsi").call(rsiCrosshair.refresh);
			svg.select("g.trendlines").call(trendline.refresh);
			svg.select("g.supstances").call(supstance.refresh)
				.selectAll("g.data .supstance").attr("clip-path", "url(#ohlcClip)"); // FIXME Component should do the clipping, too much internal knowledge here
		}

		
		// Not Portable.. how to move this function out?
		window.onresize = function() {
			d3.select('div#bigChart').call(resize).call(draw);
		}

		return bigchart;
	}

	// Randomly choose between item 0 or 1, ready to be plotted
	var chartData = {
		name: companyName[$("#searchBox2").val()].text + " (" + ticker[$("#searchBox2").val()].text + ")",
		ohlc: Preprocess(dataQuotes),
		preroll: 100
	};

	return BigChart(chartData);
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

/**
 * Creates a new portfolio by reading the form values, making the POST request with a given stock info
 */
function addPortfolio() {
	var pId = getPortfolioId();
	var ticker = $('#tickerInput').val();
	var quantity = $('#quantity').val();
	var amount = $('#totalAmount').text();
	console.log(amount);
	var jsonPortfolio = {
		"pName" : "BestPortfolio",
		"userId" : "100",
		"stocks" : {
			"ticker" : ticker,
			"quantity" : quantity,
			"totalAmount" : amount
		}
	};
	var portStr = JSON.stringify(jsonPortfolio);
	console.log(portStr);
	$.ajax({
		url: '/api/portfolio/' + pId,
		type: 'POST',
		datatype: 'application/json',
		data: jsonPortfolio
	});
}

function getPortfolioId() {
	var id;
	$.ajax({
		url: '/api/portfolio/pid/latestPid',
		type: 'GET',
		datatype: 'application/json',
		async: false
	})
		.done(function (data) {
			console.log(data);
			id = JSON.stringify(data.pId);
		})
	return id;
}