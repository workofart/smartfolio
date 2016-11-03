var ss = require('simple-statistics');

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

function getMovingAverage(priceList) {
    if (priceList != null) {
        return ss.mean(priceList);
    }
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