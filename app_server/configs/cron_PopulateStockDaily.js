var CronJob = require('cron').CronJob;
var request = require('request');
var moment = require('moment');
var connection = require('./sequelize');
var model = require('../models/models');
var common = require('../controllers/common');

var PopulateStockDaily = function(ticker) {
    model.StockDaily.findOne({
        where: { ticker: ticker },
        order: 'datetime DESC'
    }).then(function(stockDaily) {
        var interval = 86400;
        var period = '1Y';
        // No entry in the DB, get everything from google
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
                        quote = common.convertToQuoteGoogle(entries, 'days', interval);
                        quoteData.push(quote[0]);
                    }
                    else {
                        quote = common.convertToQuoteGoogle(entries, 'days', interval, dateTime);
                        quoteData.push(quote[0]);
                    }
                }

                // Actually store the data
                for (var i = 0; i < quoteData.length; i++) {
                    // If table is empty, OR if the latest entry is less than the quote date
                    if (!stockDaily || quoteData[i].date > stockDaily.datetime) {
                        model.StockDaily.create({
                                ticker: ticker,
                                datetime: quoteData[i].date,
                                open: quoteData[i].open,
                                close: quoteData[i].close,
                                high: quoteData[i].high,
                                low: quoteData[i].low
                            });
                    }
                }

            } // End callback of request to Google
        ); // End request
    })
}

var companyList = ['AAPL', 'MSFT', 'INTC', 'GOOG'];
function PopulateStockDailyForAllCompanies() {
    for (var i = 0; i < companyList.length; i++) {
        var ticker = companyList[i];
        PopulateStockDaily(ticker);
    }
}

var job = new CronJob({
    // Follows format in http://crontab.org/
    // Run every day at 6 PM
    cronTime: '0 0 18 * * 1-5',
    onTick: function() { PopulateStockDailyForAllCompanies(); },
    onComplete: function() {
        // This only runs when the entire job exits, i.e. never for a forever running job
        console.log('Job completed');
    },
    start: true, // Set to false means need to do job.start() later
    runOnInit: true // Fire once immediately
});