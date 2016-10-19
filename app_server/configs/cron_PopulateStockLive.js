var CronJob = require('cron').CronJob;
var request = require('request');
var moment = require('moment');
var connection = require('./sequelize');

// Should move this after, or not?
var GetYahooFinanceLiveQuotes = function(ticker) {

    var ticker = 'AAPL';
    // var baseUrl = 'https://query.yahooapis.com/v1/public/yql?q=';
    // var YQLquery = 'select * from yahoo.finance.quotes where symbol IN ("' + ticker + '")';
    // var moreUrl = '&format=json&env=http://datatables.org/alltables.env';

    path = 'http://download.finance.yahoo.com/d/quotes.csv?s=' + ticker + '&f=l1';

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
            // var name = quotes.Name; // FIXME, might not be the same
            var name = 'APPLE';
            var datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            // var price = parseFloat(quotes.PreviousClose) + parseFloat(quotes.Change);
            var price = body;
            console.log(ticker);
            console.log(name);
            console.log(datetime);
            console.log(price);
            
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


var job = new CronJob({
    // Follows format in http://crontab.org/
    // Runs every 30 seconds 9 AM to 5 PM Monday to Friday, last run is 16:59:30 
    cronTime: '0,30 * 9-16 * * 1-5',
    onTick: function() { GetYahooFinanceLiveQuotes('AAPL'); },
    onComplete: function() {
        // This only runs when the entire job exits, i.e. never for a forever running job
        console.log('Job completed');
    },
    start: true, // Set to false means need to do job.start() later
    runOnInit: true // Fire once immediately
});