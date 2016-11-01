
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
    var data = {
        datasets: [{
            label: 'Random Shit',
            data: dataPoints
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

        chart.update();

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
        var url = urls[Math.floor(Math.random()*2)];
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
                        console.log('You have successfully made' + quantity + ' shares of [' + ticker + ']');
                    }
                })
                    .fail(function() {
                        console.log('Transaction below was unsuccessful, please try again... \nShares: ' + quantity + '\tTicker: ' + ticker);
                    });
            });


    }
    var updateInterval = 1000; // in milliseconds
    setInterval(function() {
        createTransactions();
    }, updateInterval);
}