var exec = require('child_process').exec;
var moment = require('moment');
var model = require('../models/models');

var renderTesting = function(req, res) {

    var custom = {
        title: 'Smartfolio Testing Page'
    };

    res.render('testing', custom);
};

module.exports.testing = function(req, res) {
    renderTesting(req, res);
};


module.exports.reloadDB = function (req, res) {
    reloadDB();
}

module.exports.testingDiffDates = function(req, res) {
    var tickers = ['AAPL', 'MSFT', 'FB', 'GOOG', 'INTC'];
    for (var i = 0; i < 1000; i++) {
        var quantity = Math.floor((Math.random() * 100));
        var price = Math.floor((Math.random() * 1000));
        var date = new Date();
        date.setDate(date.getDate() - Math.floor((Math.random() * 300)));
        var datetime = moment(date).format('YYYY/MM/DD HH:mm:ss');
        var ticker = tickers[Math.floor(Math.random() * 5)];

        model.Transactions.create({
            portfolioid: 1,
            datetime: datetime,
            ticker: ticker,
            quantity: quantity,
            price: price,
            status: 1
        });
    }

    res.send('Completed');
}

function reloadDB() {
    var cmd = 'node app_server/configs/setupDB.js';
    exec(cmd, function (error, stdout, stderr) {
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}