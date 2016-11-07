var ss = require('simple-statistics');
var request = require('request');
var _ = require('underscore');

var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}


/**
 * List of strategies supported
 * - Bollinger bands
 * - Moving averages
 */

/**
 * Bollinger Bands
 * POST Request
 * url: '/insight/getLowerBound'
 * url: '/insight/getUpperBound'
 * data: { 'priceList' : [Number, Number], 'factor' : Number},
 */
module.exports.getUpperBound = function (req, res) {
    sendJsonResponse(res, 200, getUpperBound(req.body['priceList[]'], req.body['factor']));
}

module.exports.getLowerBound = function (req, res) {
    sendJsonResponse(res, 200, getLowerBound(req.body['priceList[]'], req.body['factor']));
}

/**
 * url: '/insight/dynamicMovingAverage'
 * data: {
    'duration' : 256,
    'freq' : 16
    },
 * @param req
 * @param res
 */
module.exports.dynamicMovingAverage = function(req, res) {
    var priceList;
    var ticker = req.params.ticker;
    var duration = req.query.duration;
    var freq = req.query.freq;
    var path = 'http://localhost:3000';
    var attr = ['close', 'datetime', 'ticker'];
    console.log('freq' + freq);
    console.log('duration' + duration);
    requestOptions = {
        url: path + "/api/getPriceListByTicker/" + ticker,
        method: "GET",
        qs: {
            attr: attr
        },
        contentType: 'application/json'
    };
    request (
        requestOptions,
        function(err, response, body) {
            if (response.statusCode === 200) {
                var data = JSON.parse(body);
                data = _.sortBy(data, 'datetime'); // clean up

                var totalDuration = data.length;
                console.log('Total Duration: ' + totalDuration);

                // specified duration is longer than total duration, not enough data
                if (duration > totalDuration) {
                    sendJsonResponse(res, 500, 'The specified [duration] is longer than the total duration, ' +
                        'please revise the [duration] and try again');
                    return;
                }

                // freq is not divisible by the total duration, change freq
                if (data.length % freq != 0) {
                    sendJsonResponse(res, 500, 'The specified [frequency] is not divisible by the total duration,' +
                        'please revise the [frequency]and try again');
                    return;
                }

                // specified duration is shorter than total duration, that's fine
                else if (duration <= totalDuration) {
                    var counter = 0;
                    var totalSet = []; // set containing all the priceSets, (totalDuration / freq) sets
                    var priceSet = []; // represents a set containing 'freq' prices
                    var dateSet = [];
                    for (var i = 0; i < data.length; i++) {
                        if (counter < freq) {
                            dateSet.push(data[i].datetime);
                            priceSet.push(data[i].close);
                            counter++;
                        }
                        else if (counter == freq) {
                            var obj2 = {};
                            // store the last datetime as the set's time stamp
                            obj2.dateTime = dateSet[dateSet.length - 1];
                            obj2.price = ss.mean(priceSet);
                            totalSet.push(obj2);
                            priceSet = [];
                            dateSet = [];
                            counter = 0;
                        }
                    }
                }
                sendJsonResponse(res, 200, totalSet);
            } else {
                throw err;
            }
        }
    );
}

/**
 * This function can be reused for Two moving averages
 * @param priceList - the price list based on a certain timeframe
 * @returns {*}
 */
function getMovingAverage(priceList) {
    if (priceList != null) {
        return ss.mean(priceList);
    }
    return -1;
}

function getUpperBound(priceList, factor) {
    var avg = getMovingAverage(priceList);
    var std = ss.standardDeviation(priceList);
    var upperBound = std * factor + avg;
    return upperBound;
}

function getLowerBound(priceList, factor) {
    var avg = getMovingAverage(priceList);
    var std = ss.standardDeviation(priceList);
    var lowerBound = avg - std * factor;
    return lowerBound;
}