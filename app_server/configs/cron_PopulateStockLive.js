var CronJob = require('cron').CronJob;
var request = require('request');
var moment = require('moment');
var connection = require('./sequelize');

// Should move this after, or not?
var PopulateStockLive = function(ticker) {

    // var baseUrl = 'https://query.yahooapis.com/v1/public/yql?q=';
    // var YQLquery = 'select * from yahoo.finance.quotes where symbol IN ("' + ticker + '")';
    // var moreUrl = '&format=json&env=http://datatables.org/alltables.env';

    path = 'http://download.finance.yahoo.com/d/quotes.csv?s=' + ticker + '&f=l1n';

    // console.log(baseUrl + YQLquery + moreUrl);

    requestOptions = {
        // uri: baseUrl + YQLquery + moreUrl,
        uri: path,
        method: "GET",

    };

    request (
        requestOptions,
        function(err, response, body) {
            // If ticker is a list, than quotes is a array of jsons
            // var json = JSON.parse(body);
            // var quotes = json["query"]["results"]["quote"];

            // For single quote, quotes is just a json
            // var ticker = quotes.symbol;
            body = String(body).split(/,(.+)?/);
            var name = body[1].substring(1, body[1].length-1);
            var datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            // var price = parseFloat(quotes.PreviousClose) + parseFloat(quotes.Change);

            var price = body[0];
            console.log('\n----------\nbody: ' + body);
            console.log('ticker ' + ticker);
            console.log('name ' + name);
            console.log('datetime ' + datetime);
            console.log('price ' + price);

            // Insert into stock_live table
            // TODO: Create a model for this table and use Create() instead
            query = 'INSERT INTO stock_live (ticker, name, datetime, price) VALUES (:ticker, :name, :datetime, :price);'
            connection.query(query, 
                {
                    replacements: {
                        ticker: ticker,
                        name: name,
                        datetime: datetime,
                        price: price
                    },
                    type: connection.QueryTypes.INSERT
                })
        }
    );
}


var companyList = ['AAPL', 'MSFT', 'INTC', 'GOOG', 'FB', 'NVDA', 'AMZN', 'QCOM', 'NFLX', 'SBUX'];
function PopulateStockLiveForAllCompanies() {
    for (var i = 0; i < companyList.length; i++) {
        var ticker = companyList[i];
        PopulateStockLive(ticker);
    }
}

var job = new CronJob({
    // Follows format in http://crontab.org/
    // Runs every 30 seconds 9 AM to 5 PM Monday to Friday, last run is 16:59:30 
    cronTime: '0,30 * 9-16 * * 1-5',
    onTick: function() { PopulateStockLiveForAllCompanies(); },
    onComplete: function() {
        // This only runs when the entire job exits, i.e. never for a forever running job
        console.log('Job completed');
    },
    start: true, // Set to false means need to do job.start() later
    runOnInit: true // Fire once immediately
});