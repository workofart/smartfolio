// global buy/sell flag
var buy = 1;

function getAllPortfolios() {
    $.ajax({
        url: '/api/portfolio',
        type: 'GET',
        datatype: 'application/json'
    })
        .done(function(data){
            console.log(JSON.stringify(data));
            // var currentPrice = [10, 12];
            // for (var i = 0; i < data.length; i++) {
                // var portfolio = data[i];

                // console.log('Current Price: $' + currentPrice);
                // console.log('Inception % change: ' + getPercentageChange(getPurchasePrice(portfolio), currentPrice));
                // console.log('Inception $ change: ' + getDollarChange(getPurchasePrice(portfolio), currentPrice));

                // Create the panels based on the portfolios we have
                // var htmlCode = '<div id="accordion" role="tablist" aria-multiselectable="true" class="panel-group"> <div class="panel panel-primary">' +
                //     ' <div role="tab" id="heading' +
                //     portfolio.pId + '" class="panel-heading"> <h4 class="panel-title"><a role="button" data-toggle="collapse" ' +
                //     'data-parent="#accordion" href="#portfolio_' +
                //     portfolio.pId + '_Body" aria-expanded="false" aria-controls="portfolio_' +
                //     portfolio.pId + '_Body">Portfolio ' +
                //     portfolio.pId + '</a></h4> </div><div id="portfolio_' +
                //     portfolio.pId + '_Body" role="tabpanel" aria-labelledby="heading' +
                //     portfolio.pId + '" class="panel-collapse collapse in"> <div class="panel-body"> Stocks: ' +
                //     JSON.stringify(portfolio.stocks)+
                //     ' <div class="row"> <div class="col-md-6"> <div class="jumbotron"> <div class="container"> <div class="portfolio-breakdown-chart">' +
                //     '</div></div></div></div><div class="col-md-6"> <div class="jumbotron"> <div class="container"> <div class="stock-daily-performance">' +
                //     '</div></div></div></div></div><div class="jumbotron"> <div class="container"> <div id="portfolio-performance"></div></div></div></div></div></div></div>';
                // $('#panelList').append(htmlCode);

                // console.log('portfolio: ' + JSON.stringify(portfolio));
            // }
        });
}

function getPortfolioById() {
    var id = $('#getPIdParam').val();
    $.ajax({
        url: '/api/portfolio/'+id,
        type: 'GET',
        datatype: 'application/json'
    })
        .done(function(data) {
            console.log(JSON.stringify(data));
        })
}

var ticker = [];

var companyList = $.ajax({
    url: '/market/GetCompanyList',
    type: 'GET'
}).done(function(data) {
    $("#tickerBox").append($("<option>"));
    for (var i = 0; i < data.length; i++) {
        ticker.push({
            id: i,
            text: data[i].ticker
        });
    }
    $("#tickerBox").select2({
        // Placeholder defined in Jade file apparently doesn't work
        placeholder: "Ticker",
        data: ticker
    });

    return data;
})


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
    if (latestPrice == '') {
        latestPrice = $('#latestPrice_newStock').text().substr(1);
    }
    console.log('LatestPrice: ' + latestPrice);
    var quantity = $('#quantity').val();
    if (quantity == '') {
        quantity = $('#quantity_newStock').val();
    }
    console.log('Quantity: ' + quantity);
    if (isNumber(quantity)) {
        var totalAmount = (Number(latestPrice) * Number(quantity)).toFixed(2);
        $('#totalAmount').text(totalAmount);
        $('#totalAmount_newStock').text(totalAmount);
    }
}


function deletePortfolioById() {
    var id = $('#deletePIdParam').val();
    $.ajax({
        url: '/api/portfolio/'+id,
        type: 'DELETE',
        datatype: 'application/json'
    })
        .done(function(data) {
            console.log(JSON.stringify(data));
        })
}

/**
 * Calculates the purchase price based on amount and quantity for every stock in the portfolio
 *
 * @param portfolio - the portfolio we are calculating the prices for
 * @returns - an array of prices the index corresponding to the index of the stock within a given portfolio
 */
function getPurchasePrice(portfolio) {
    var prices = [];
    for (var i = 0; i < portfolio.stocks.length; i++){
        var stock = portfolio.stocks[i];
        var price = stock['amount'] / stock['quantity'];
        prices.push(price);
        // console.log('price:' + price);
    }

    return prices;
}

/**
 * Utility function for calculating and formatting percentage changes
 * @param purchasePrice - array of purchase prices for each stock within a portfolio
 * @param currentPrice - array of purcahse prices for each stock within a portfolio
 * @returns {string}
 */
function getPercentageChange(purchasePrice, currentPrice) {
    var percentageChanges = [];
    for (var i = 0; i < purchasePrice.length; i++){
        percentageChanges.push(((currentPrice[i] - purchasePrice[i])/ purchasePrice[i]) * 100 + '%');
    }

    return percentageChanges;
}

function getDollarChange(purchasePrice, currentPrice) {
    var dollarChanges = [];
    for (var i = 0; i < purchasePrice.length; i++){
        dollarChanges.push(currentPrice[i] - purchasePrice[i]);
    }
    return dollarChanges;
}

function fillBuyStockForm (ticker) {
    console.log('ticker' + ticker);
    getLatestPrice(ticker);
    buy = 1;
}

function fillSellStockForm (ticker) {
    console.log('ticker' + ticker);
    getLatestPrice(ticker);
    buy = 0;
}

function createPortfolio () {
    var portfolioname = $('#portfolioname').val();
    console.log('input name: ' + portfolioname);
    var jsonPortfolio = {
        "pName" : portfolioname
    };

    $.ajax({
        url: '/api/portfolio',
        type: 'POST',
        datatype: 'application/json',
        data: jsonPortfolio
    });
}

// function getPortfolioCompositionById(pid) {
//     var urlparts = '/' + pid;
//     $.ajax({
//             url: '/api/portfolio/composition' + urlparts,
//             type: 'GET',
//             datatype: 'application/json'
//         })
//         .done(function(data) {
//             console.log(data);
//             // Do not need this after converting money to numeric
//             // for (var i = 0; i < data.length; i++) {
//             //     data[i].portion = Number((data[i].portion).replace(/[^0-9\.]+/g,""));
//             // }
//             populateCompositionChart(data, '#myChart');
//         });
// }

function getPortfolioBookValueById(pid) {
    $.ajax({
            url: '/api/portfolio/bookvalue/' + pid,
            type: 'GET',
            datatype: 'application/json'
        })
        .done(function(data) {
            console.log(data);
            populateCompositionChart(data, '#myChart', 'Book Value');
        });
}

function getPortfolioRealValueById(pid) {
    $.ajax({
            url: '/api/portfolio/realvalue/' + pid,
            type: 'GET',
            datatype: 'application/json'
        })
        .done(function(data) {
            console.log(data);
            populateCompositionChart(data, '#nv-donut-chart', 'Market Value');
        });
}

function fillLatestPrice() {
    var ticker = $("#tickerBox option:selected").text();
    console.log('filllatestPrice: ' + ticker);
    getLatestPrice(ticker);
}

function getLatestPrice(ticker) {
    var url = '/getLatestPrice'
    $.ajax({
        url: url,
        type: 'GET',
        data: {
            "ticker" : ticker
        },
        datatype: 'application/json'
    })
        .done(function (data) {
            console.log('getting latest price: $' + data);
            $('#latestPrice').text('$'+ data);
            $('#latestPrice_newStock').text('$' + data);
            $('#tickerDisplay').text(ticker);
        })
}

function performTransaction() {
    if (buy == 0) {
        var url = '/api/transaction/sellStock';
    } else {
        var url = '/api/transaction/buyStock';
    }
    var arr = window.location.href.split('/');
    var currentpid = arr[arr.length - 1];

    var ticker = $('#tickerDisplay').text();
    var latestPrice = $('#latestPrice').text().substr(1);
    var quantity = $('#quantity').val();

    ticker == '' ? ticker = $("#tickerBox option:selected").text() : ticker = $('#tickerDisplay').text();
    latestPrice == '' ? latestPrice = $('#latestPrice_newStock').text().substr(1) : latestPrice = $('#latestPrice').text().substr(1);
    quantity == '' ? quantity = $('#quantity_newStock').val() : quantity = $('#quantity').val();

    $.ajax({
        url: url + '/' + currentpid,
        type: 'POST',
        data: {
            "ticker" : ticker,
            "quantity" : quantity,
            "price" : latestPrice
        },
        datatype: 'application/json'
    })
}

function getTransactions () {
    var arr = window.location.href.split('/');
    var currentpid = arr[arr.length - 1];

    $.ajax({
        url: '/api/transaction' + '/' + currentpid,
        type: 'GET',
        data: {},
        datatype: 'application/json'
    })
        .done(function (data) {
            console.log(data);
        })
}

$("#tickerBox").on("select2:select", function() {
    var index = $("#tickerBox").val();
    var $box2 = $("#tickerBox").select2();
    $box2.val(index).trigger("change");
});


/* D3 */
var populateCompositionChart = function(data, chartId, title) {
    if (data.length === 0) {
        data.push({ticker: "No Data", value: ""});
    }
    var blue="#348fe2",
    blueLight="#5da5e8",
    blueDark="#1993E4",
    aqua="#49b6d6",
    aquaLight="#6dc5de",
    aquaDark="#3a92ab",
    green="#00acac",
    greenLight="#33bdbd",
    greenDark="#008a8a",
    orange="#f59c1a",
    orangeLight="#f7b048",
    orangeDark="#c47d15",
    dark="#2d353c",
    grey="#b6c2c9",
    purple="#727cb6",
    purpleLight="#8e96c5",
    purpleDark="#5b6392",
    red="#ff5b57";

    nv.addGraph(
        function(){
            var a = nv.models.pieChart()
                .x(function(e){return e.ticker})
                .y(function(e){return e.value})
                .showLabels(!0)
                .labelThreshold(.05)
                .labelType("percent")
                .donut(true)
                .donutRatio(.35)
                .width(600)
                .height(400);

            a.title(title);
            a.pie.labelsOutside(true).donut(true);
            
            // LISTEN TO WINDOW RESIZE
            // nv.utils.windowResize(a.update);
            // LISTEN TO CLICK EVENTS ON SLICES OF THE PIE/DONUT
            // a.pie.dispatch.on('elementClick', function() {
            //     code...
            // });
            // a.pie.dispatch.on('chartClick', function() {
            //     code...
            // });
            // LISTEN TO DOUBLECLICK EVENTS ON SLICES OF THE PIE/DONUT
            // a.pie.dispatch.on('elementDblClick', function() {
            //     code...
            // });
            // LISTEN TO THE renderEnd EVENT OF THE PIE/DONUT
            // a.pie.dispatch.on('renderEnd', function() {
            //     code...
            // });

            //nv.utils.windowResize(function() { a.update() });
            return d3.select(chartId)
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 600 400")
                .classed("svg-content-responsive", true)
                .datum(data)
                .transition()
                .duration(350)
                .call(a)
                .style({ 'width': 600, 'height': 400 }),a
        }
    );
}

function getPortfolioPerformance(pid) {
    
    var completed_requests = 0;
    var graph = [];

    // Book
    $.ajax({
        url: '/api/portfolio/bookperformance/' + pid,
        type: 'GET',
        datatype: 'application/json'
    })
    .done(function(data) {
        // Need to sort first because it's possible to have out of order
        // due to ajax requests
        data.sort(function(a, b) {
            return a.x - b.x;
        })
        // Need to recast date into an actual date object
        for (var i = 0; i < data.length; i++) {
            data[i].x = new Date(data[i].date);
        }
        
        graph.push({area: false, key: 'Book Value', values: data});

        completed_requests++;
        if (completed_requests == 2) {
            populatePerformanceLineGraph(graph, '#performance-line-graph svg')
        }
    })

    // Real
    $.ajax({
        url: '/api/portfolio/realperformance/' + pid,
        type: 'GET',
        datatype: 'application/json'
    })
    .done(function(data) {
        // Need to sort first because it's possible to have out of order
        // due to ajax requests
        data.sort(function(a, b) {
            return a.x - b.x;
        })
        // Need to recast date into an actual date object
        for (var i = 0; i < data.length; i++) {
            data[i].x = new Date(data[i].date);
        }
        graph.push({area: false, key: 'Market Value', values: data});

        completed_requests++;
        if (completed_requests == 2) {
            populatePerformanceLineGraph(graph, '#performance-line-graph svg')
        }
    })
}

var populatePerformanceLineGraph = function(data, chartId) {
    console.log(data);
    var values = data[0].values;

    // Added percentage
    var perc = [];
    var data2 = [];
    var market_values = data[0].key == 'Market Value' ? data[0].values : data[1].values;
    var book_values = data[0].key == 'Book Value' ? data[0].values : data[1].values;
    for (var i = 0; i < market_values.length; i++) {
        perc.push({ date: market_values[i].date, x: market_values[i].x, y: (market_values[i].y - book_values[i].y)});
    }
    data2.push({area: true, key: "Unrealize Gain", values: perc});

    nv.addGraph(function() {
        var chart = nv.models.lineWithFocusChart();
        
        // Set focus to most recent month
        // chart.brushExtent([values[values.length-4].x, values[values.length-1].x]);

        // This requires values.x to be in Date format already
        chart.xAxis
            .axisLabel("Date")
            .tickFormat( function(d) { return d3.time.format('%Y-%m-%d')(new Date(d)); });
        chart.x2Axis
            .axisLabel("Date")
            .tickFormat( function(d) { return d3.time.format('%Y-%m-%d')(new Date(d)); });

        chart.yTickFormat(d3.format('s'));
        chart.useInteractiveGuideline(true);

        d3.select('#performance-line-graph svg')
            .datum(data)
            .call(chart);

        nv.utils.windowResize(chart.update);
        return chart;
    });

     nv.addGraph(function() {
        chart = nv.models.lineChart()
            .options({
                duration: 300,
                useInteractiveGuideline: true
            })
        ;
        // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
        chart.xAxis
            .axisLabel("Date")
            .tickFormat( function(d) { return d3.time.format('%Y-%m-%d')(new Date(d)); });
        
        chart.yAxis
            .axisLabel('Unrealized Gain/Loss in %')
            .tickFormat(d3.format('s'));

        d3.select('#performance-perc-graph svg')
            .datum(data2)
            .call(chart);

        nv.utils.windowResize(chart.update);
        return chart;
    });
}

/**
 * Auto fill buy stock form price and reveal more info panel
 */
$('#tickerBox').on('select2:select', function(e) {
    fillLatestPrice();
    $('#moreInfoPanel').show(400, function() {
        createMiniChart();
        $('#commentList').show(500);
    }); // show more info panel

});

/**
 * Used to create the mini chart in the buy stock form
  */
function createMiniChart() {
    var selectedTicker = $("#tickerBox option:selected").text();
    getPriceTrend(selectedTicker);
    var label = selectedTicker + '\'s recent price trend';
    $('#miniHeader').text(label);
}

function getPriceTrend(ticker) {
    console.log('getPriceTrend called: ' + ticker);
    var attr = {"attr" : ["close", "datetime"]};
    $.ajax({
            url: '/api/getPriceListByTicker/' + ticker,
            method: 'GET',
            data: attr,
            datatype: 'application/json',
            success: function (data) {
                var priceList = [];
                for (var i = 0; i < data.length; i++){
                    var obj = {};
                    obj.y = data[i].close;
                    obj.x = data[i].datetime;
                    priceList.push(obj);
                }
                // console.log('pricelist: \n' + JSON.stringify(priceList));
                var ctx = document.getElementById("buyStockChart");
                var scatterChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: ticker,
                            data: priceList
                        }]
                    },
                    options: {
                        scales: {
                            xAxes: [{
                                type: 'time',
                                position: 'bottom'
                            }]
                        }
                    }
                });
            },
            error: function(e) {
                throw e;
            }

        });
}

function getCompositionTableView(currentpid) {

    $.ajax({
        url: '/api/portfolio/composition/' + currentpid,
        type: 'GET',
        datatype: 'application/json'
    })
        .done(function(data) {

            for (var i = 0; i < data.length; i++) {
                var trNode = $('<tr>');
                var tickerNode = $('<td>' + data[i].ticker + '</td>');
                var portionNode = $('<td>' + data[i].portion + '</td>');
                trNode.append(tickerNode);
                trNode.append(portionNode);
                $('#stockTableBody').append(trNode);
            }
            console.log(data);
            return data;
        });
}

function getPortfolioTransactionVolume(pid) {
    $.ajax({
        url: '/api/portfolio/volume/' + pid,
        type: 'GET',
        datatype: 'application/json'
    })
    .done(function(data) {

        var graph = [];
        for (var i = 0; i < data.length; i++) {
            var key = data[i].ticker;
            var values = [];
            var j;
            for (j = i; j < data.length; j++) {
                if (data[j].ticker != key) {
                    break;
                }
                values.push({x: new Date(data[j].date), y: parseInt(data[j].value)});
            }
            i = j - 1;
            graph.push({key: key, values: values });
        }

        console.log(graph);
        populateVolumeGraph(graph);
    })
}


function populateVolumeGraph(data) {
    nv.addGraph(function() {
        var chart = nv.models.multiBarChart()
        .duration(350)
        .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
        .rotateLabels(0)      //Angle to rotate x-axis labels.
        .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
        .groupSpacing(0.1)    //Distance between each group of bars.
        ;

        chart.multibar.stacked(true);

        chart.xAxis
            .axisLabel("Date")
            .tickFormat( function(d) { return d3.time.format('%Y-%m-%d')(new Date(d)); });

        // chart.xAxis
        //     .tickFormat(d3.format(',f'));

        chart.yAxis
            .tickFormat(d3.format(',.1f'));

        d3.select('#volume-graph svg')
            .datum(data)
            .call(chart);

        nv.utils.windowResize(chart.update);
        return chart;
    });
}