
/**
 * Only for testing purposes
 * Buys/sells stocks for portfolio 2
 */
function performTransactionTest() {
    var tickers = ['AAPL', 'MSFT', 'FB'];
    for (var i = 0; i < 50; i++) {
        // Randomly decide between buy/sell
        if (Math.random() <= 0.5) {
            var url = '/api/transaction/sellStock/2';
        } else {
            var url = '/api/transaction/buyStock/2';
        }
        var data = {};
        data.ticker = tickers[Math.floor(Math.random() * 3)];
        data.quantity = Math.floor(Math.random() * 80) + 5;
        data.price = Math.floor(Math.random() * 100) + 21;
        console.log(data);

        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            datatype: 'application/json'
        });
    }

}

function performTransactionTest2() {
    $.ajax({
        url: '/testing/withDates',
        type: 'GET',
    });
}

function reloadDB() {
    $.ajax({
        url: '/testing/reloadDB',
        type: 'GET',
        data: {},
        datatype: 'application/json'
    });
}

function autoUpdateGraph() {
    var dataPoints = []; // to store the randomly generated datapoints
    var upperBound = []; // to store the calculated bollinger band upper bound
    var lowerBound = []; // to store the calculated bollinger band lower bound
    var factor = 2; // Used to set the upper/lower bounds (factor for standard Deviation)

    var data = {
        datasets: [{
            label: 'Random Shit',
            data: dataPoints
        },{
            label: 'UpperBound',
            data: upperBound,
            pointBackgroundColor: "#3845FF",
        },{
            label: 'LowerBound',
            data: lowerBound,
            pointBackgroundColor: "#FF584B",
        }]
    };
    var options = {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom'
            }]
        }
    };

    var ctx = document.getElementById("autoUpdateGraph");
    var chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });


    // Initialize the graph parameters
    // Bounds for random numbers
    var xVal = 0;
    var yVal = 100;

    var updateInterval = 100; // in milliseconds
    var visibleLimit = 500; // number of dataPoints visible at any point

    /**
     * Function for updating the chart with random datapoints
     * @param count - how random we want the numbers
     */
    var updateChart = function (count) {
        count = count || 1;
        // count is number of times loop runs to generate random dataPoints.

        // generate random number
        for (var j = 0; j < count; j++) {
            yVal = yVal +  Math.round(5 + Math.random() *(-10));
            dataPoints.push({
                x: xVal,
                y: yVal
            });

            xVal++; // move the x-axis to the right
        };

        // check if the number of data points reached the visible limit, shift if needed
        if (dataPoints.length > visibleLimit)
        {
            dataPoints.shift();
        }

        // Extract the y values into a separate array for bollinger bands calculation
        var result = dataPoints.map(function(a) { return a.y});

        // Calculate bollinger bands
        $.ajax({
            url: '/insight/getUpperBound',
            method: 'POST',
            data: { 'priceList' : result, 'factor' : factor},
            datatype: 'application/json'
        })
            .done(function (data) {
                // console.log('Upper bound: ' + data);

                // Insert the upper bound for the current dataset
                upperBound.push({
                    x: xVal,
                    y: data
                });

                if (upperBound.length > visibleLimit)
                {
                    upperBound.shift();
                }
                // Calculate bollinger bands
                $.ajax({
                    url: '/insight/getLowerBound',
                    method: 'POST',
                    data: { 'priceList' : result, 'factor' : factor},
                    datatype: 'application/json'
                })
                    .done(function (data) {
                        // Insert the upper bound for the current dataset
                        lowerBound.push({
                            x: xVal,
                            y: data
                        });

                        if (lowerBound.length > visibleLimit)
                        {
                            lowerBound.shift();
                        }

                        chart.update();
                    });
            });
    };
    updateChart(visibleLimit);
    setInterval(function() { updateChart()
    }, updateInterval);
}

function generateFakeTransactions() {

    var createTransactions = function () {
        // random parameters
        var quantity = (Math.floor(Math.random()*10+1));
        var tickers = ['AAPL', 'MSFT', 'FB', 'ADMP', 'AXAS','ACIA','ACTG','ACHC','ACAD','ACST'];
        var ticker = tickers[Math.floor(Math.random()*10)];
        var urls = ['/api/transaction/buyStock', '/api/transaction/sellStock'];
        var buySell = ['bought', 'sold'];
        var buySellRandomNum = Math.floor(Math.random()*2);
        var url = urls[buySellRandomNum];
        var currentpid = 3;

        // get latest price
        $.ajax({
            url: '/getLatestPrice',
            type: 'GET',
            data: {
                "ticker" : ticker
            },
            datatype: 'application/json'
        })
            .done(function (data) {
                var latestPrice = data;
                $.ajax({
                    url: url + '/' + currentpid,
                    type: 'POST',
                    data: {
                        "ticker" : ticker,
                        "quantity" : quantity,
                        "price" : latestPrice
                    },
                    datatype: 'application/json',
                    success: function() {
                        console.log('You have successfully ' + buySell[buySellRandomNum] + ' ' + quantity + ' shares of [' + ticker + ']');
                    }
                })
                    .fail(function() {
                        console.log('Transaction below was unsuccessful, please try again... \n|' + buySell[buySellRandomNum] + '| Shares: ' + quantity + '\tTicker: ' + ticker);
                    });
            });


    }
    var updateInterval = 500; // in milliseconds
    setInterval(function() {
        createTransactions();
    }, updateInterval);
}

function testDynamicMovingAverage() {
    $.ajax({
        url: '/insight/dynamicMovingAverage/FB',
        type: 'GET',
        data: {
            'duration' : 32,
            'freq' : 16
        },
        error: function(req, status, err) {
            console.log('==========ERROR===========');
            console.log(req.responseText);
            // console.log(status.responseText);
        }
    })
    .done(function(data) {
        console.log(JSON.stringify(data));
        return data;
    });
}

/**
 * Given a list of prices, duration and frequency, calculate the
 * average
 * @param data
 * @param duration
 * @param freq
 */
function calculateMovingAverage(data, duration, freq) {
    data = _.sortBy(data, 'date'); // clean up

    var totalDuration = data.length;
    // console.log('Total Duration: ' + totalDuration);
    // console.log('Given Duration: ' + duration);

    // specified duration is longer than total duration, not enough data
    if (duration > totalDuration) {
        alert('The specified [duration] is longer than the total duration, ' +
            'please revise the [duration] and try again');
        return;
    }

    // freq is not divisible by the total duration, change freq
    // if (data.length % freq != 0) {
    //     alert('The specified [frequency] is not divisible by the total duration,' +
    //         'please revise the [frequency]and try again');
    //     return;
    // }

    // specified duration is shorter than total duration, that's fine
    else if (duration <= totalDuration) {
        var counter = 0;
        var totalSet = []; // set containing all the priceSets, (totalDuration / freq) sets
        var priceSet = []; // represents a set containing 'freq' prices
        for (var i = 0; i < duration; i++) {
            if (counter < freq) {
                priceSet.push(data[totalDuration - i - 1].close);
                counter++;
            }
            else if (counter == freq) {
                var subAverage = ss.mean(priceSet);
                totalSet.push(subAverage);
                priceSet = [];
                counter = 0;
            }
        }
        // console.log('totalSet: ' + totalSet);
    }
    console.log('Moving average: $' + ss.mean(totalSet).toFixed(3));
    $('#movingAverageText').text('$' + ss.mean(totalSet).toFixed(3));
}
var MFsymbol = [];
var MFName = [];

var mutualFundList = $.ajax({
    url: '/market/GetMutualFundList',
    type: 'GET'
}).done(function(data) {
    $("#mfSearchBox").append($("<option>"));
    for (var i = 0; i < data.length; i++) {
        MFsymbol.push({
            id: i,
            text: data[i].ticker
        });
        MFName.push({
            id: i,
            text: data[i].name
        });
    }
    $("#mfSearchBox").select2({
        // Placeholder defined in Jade file apparently doesn't work
        placeholder: "Company Name",
        data: MFName
    });

    // Search a random ticker when page loads
    var random = Math.floor((Math.random() * data.length) + 1);
    var $box1 = $("#mfSearchBox").select2();
    $box1.val(1).trigger("change");
    searchMutualFund();

    return data;
})

$('#mfSearchBox').on('select2:select', function(e) {
    searchMutualFund();
    var ctx = document.getElementById("buyStockChart");

});


function PopulateTable(ticker, data) {
    var table = $("#stockQuotes").DataTable({
        retrieve: true,
        autoWidth: false
    });
    table.clear().draw();
    for (var i = 0; i < data.length; i++) {
        var array = [];
        array.push(new Date(data[i].date));
        array.push(data[i].close);
        table.row.add(array);
    }
    table.draw();
}
// Slider for Range
var rangeSlider = $('#rangeSlider').slider({
    ticks: [0, 30, 60, 90, 120, 150, 180],
    ticks_positions: [0, 16.6, 33.2, 49.8, 66.4, 83, 100],
    ticks_labels: ['0', '30', '60', '90', '120', '150', '180'],
    ticks_snap_bounds: 2,
    formatter: function(value) {
        $('#rangeSliderText').text('Past ' + value + ' days');
        // return 'Current value: ' + value;
    }
});
$('#rangeSlider').on('slideStop', function (e) {
    searchMutualFund();
});

// Slider for Frequency
var freqSlider = $('#freqSlider').slider({
    formatter: function(value) {
        $('#freqSliderText').text('   Every ' + value + ' days');
        // return 'Current value: ' + value;
    }
});
$('#freqSlider').on('slideStop', function (e) {
    searchMutualFund();
});

// Function for handling when search button is clicked
var searchMutualFund = function() {
    var selectedTicker = MFsymbol[$("#mfSearchBox").val()].text;
    var interval = 86400;
    var period = '1Y';
    var exchange = 'MUTF_CA'
    var results;

    $.ajax(
        {
            url: "/market/GetGoogleFinanceData?ticker=" + selectedTicker + "&interval=" + interval + "&period=" + period + "&exchange=" + exchange,
            type: "GET"
        })
        .done(function(data) {
            var duration = 30;
            var freq = 1;
            PopulateTable(selectedTicker, data);
            console.log('rangeSlider: ' + rangeSlider.slider('getValue'));
            // console.log('freqSlider: ' + $('#freqSlider').value);
            calculateMovingAverage(data, rangeSlider.slider('getValue'), freqSlider.slider('getValue'));
            // calculateMovingAverage(data, duration, freq);
            populateControlPanel(data, selectedTicker);
            // $('#rangeH4').append('<input id="rangeSlider" data-slider-id="rangeSlider" type="text" data-slider-min="1" data-slider-max="' + data.length + '" data-slider-step="1" data-slider-value="' + data.length / 10 + '"></input>');
            // $('#rangeH4').append('<small id="rangeSliderText"></small>');
            $('#MFPanel').show(400);
            $('#moreInfoPanel').show(400, function() {
                createMiniChart(data, selectedTicker);
            });
        })
}

/**
 * Used to create the mini chart in the buy stock form
 */
function createMiniChart(data, selectedTicker) {
    getPriceTrend(data, selectedTicker);

}

function populateControlPanel(data, selectedTicker){
    var label = selectedTicker + '\'s recent price trend';
    $('#miniHeader').text(label);

    $('#currentPrice').text('$' + data[data.length-1].close);


    prices = []
    for (var i = 0; i < data.length; i++) {
        prices.push(parseInt(data[i].close));
    }
    // console.log(prices);
    meanPrice = ss.mean(prices);
    $('#averagePrice').text('$' + meanPrice.toFixed(3));
    stdPrice = ss.standardDeviation(prices);
    $('#stdevPrice').text('$' + stdPrice.toFixed(3));

    // console.log(data);
    // console.log('rangeSlider: ' + $('#rangeSlider').value);
    // console.log('freqSlider: ' + $('#freqSlider').value);
    // calculateMovingAverage(data, $('#rangeSlider').value, $('#freqSlider').value);

}

function getPriceTrend(data, ticker) {
    console.log('getPriceTrend called');

    var priceList = [];
    for (var i = 0; i < data.length; i++) {
        var obj = {};
        obj.y = data[i].close;
        obj.x = data[i].date;
        priceList.push(obj);
    }
    // console.log('priceList: ' + String(priceList[0].x));
    if (priceList != '') {
        var ctx = document.getElementById("buyStockChart");
        // resizing
        // ctx.canvas.width = 600;
        // ctx.canvas.height = 600;
        if (ctx) {
            ctx.remove();
            $('#chartPanel').append('<canvas id="buyStockChart"><canvas>');
        }

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
                },
                responsive: true,
                showLine: true,
                borderColor: "rgba(75,192,192,1)"
            }
        });

    } else {
        $('#miniHeader').text('Sorry, the selected ticker doesn\'t have any price trend, please check back again');
    }
}


