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
module.exports.getUpperBound = function (req, res) {
    sendJsonResponse(res, 200, getUpperBound(req.body['priceList[]']));
}

module.exports.getLowerBound = function (req, res) {
    sendJsonResponse(res, 200, getLowerBound(req.body['priceList[]']));
}

function getMovingAverage(priceList) {
    if (priceList != null) {
        return ss.mean(priceList);
    }
}

function getUpperBound(priceList) {
    var avg = getMovingAverage(priceList);
    var std = ss.standardDeviation(priceList);
    // console.log('std: ' + std);
    var upperBound = std * 2 + avg;
    // console.log('upperBound: ' + upperBound);
    return upperBound;
}

function getLowerBound(priceList) {
    var upperBound = getUpperBound(priceList);
    var avg = getMovingAverage(priceList);
    return avg - (upperBound - avg);
}