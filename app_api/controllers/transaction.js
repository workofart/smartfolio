const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/smartfolio';

var config = {
    user: 'postgres',
    database: 'smartfolio',
    password: 'Welcome1',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};

const client = new pg.Client(config);

var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}


module.exports.buyStock = function (req, res) {
    var pId = req.params.id;
    var buyStock = "\
    INSERT INTO transactions (portfolioid, datetime, ticker, quantity, price)\
    VALUES (" +
            pId + ", " +
            "CURRENT_TIMESTAMP,'" +
            req.body.stocks['ticker'] + "', " +
            req.body.stocks['quantity'] + ", " +
            req.body.stocks['price'] + ")\
     ;";

    client.connect();
    client.query(buyStock, function (err, result) {
        if (err) throw err;
        sendJsonResponse(res, 200, result);
        client.end();
    });


}

module.exports.sellStock = function (req, res) {
    var pId = req.params.id;
    var sellStock = "\
    INSERT INTO transactions (portfolioid, datetime, ticker, quantity, price)\
    VALUES (" +
        pId + ", " +
        "CURRENT_TIMESTAMP,'" +
        req.body.stocks['ticker'] + "', -" +
        req.body.stocks['quantity'] + ", " +
        req.body.stocks['price'] + ")\
     ;";

    client.connect();
    client.query(sellStock, function (err, result) {
        if (err) throw err;
        sendJsonResponse(res, 200, result);
        client.end();
    });
}

module.exports.getTransactions = function (req, res) {
    var pId = req.params.id;
    var query = "\
    SELECT * FROM TRANSACTIONS\
    WHERE TRANSACTIONS.PORTFOLIOID = " +
        pId + ";\
    ";
    client.connect();
    client.query(query, function (err, result) {
        if (err) throw err;
        if (result['rows'] != '[]') {
            result = result['rows'];
            sendJsonResponse(res, 200, result);
        }
        client.end();
    });

}

module.exports.getAllTransactions = function (req, res) {
    var pId = req.params.id;
    var query = "\
    SELECT * FROM TRANSACTIONS;\
    ";
    client.connect();
    client.query(query, function (err, result) {
        if (err) throw err;
        if (result['rows'] != '[]') {
            result = result['rows'];
            sendJsonResponse(res, 200, result);
        }
        client.end();
    });
}

