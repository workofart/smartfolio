var moment = require('moment');

var apiOptions = {
    server: "http://localhost:3000"
};
module.exports.apiOptions = apiOptions;

var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}
module.exports.sendJsonResponse = sendJsonResponse;


var convertToQuoteGoogle = function (quoteArray, intervalText, interval, time) {
    // Returns array of dictionary
    var quote = []; // create quote object
    var offset = quoteArray[0];
    // if true, then we are in the offset section
    if (Number(offset) > 9999) {
        var newDate = moment.unix(offset); // the offset is actually an unix time
    }
    else {
        var newDate = time.clone().add(offset, intervalText);		
    }
    var newDateStr = newDate.toDate();
    quote.push({
        date: newDateStr,
        close: quoteArray[1],
        high: quoteArray[2],
        low: quoteArray[3],
        open: quoteArray[4],
        volume: quoteArray[5]
    })
    return quote;
}
module.exports.convertToQuoteGoogle = convertToQuoteGoogle;