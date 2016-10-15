var request = require('request');
var _ = require('underscore');

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

// GET: localhost:3000/api/portfolio/123
module.exports.getPortfolioById = function (req, res){
    var query ="\
        SELECT t1.portfolioid AS pId,\
            portfolioname AS pName,\
            userid\
    FROM    portfolios t1\
    WHERE   t1.portfolioid = " + req.params.id + ";\
    ";

    client.connect();
    console.log(query);
    client.query(query, function (err, result) {
        // console.log(result['rows']);
        if (result['rows'] != '[]') {
            result = result['rows'];
            if (err) throw err;
            sendJsonResponse(res, 200, result);
        }
        client.end();
    });

};

// POST: localhost:3000/api/portfolio
module.exports.createPortfolio = function (req, res) {

    var query ="\
    INSERT INTO portfolios (userid, portfolioname)\
    VALUES (1,\
            'BESTportfolio') returning portfolioid;\
    ";

    client.connect();
    client.query(query, function (err, result) {
        var pId = result['rows'][0].portfolioid;
        var insertTranscation ="\
        INSERT INTO transactions (portfolioid, datetime, ticker, quantity, price)\
        VALUES (" +
            pId + ", " +
            "CURRENT_TIMESTAMP,'" +
            req.body['stocks[ticker]'] + "', " +
            req.body['stocks[quantity]'] + ", " +
            req.body['stocks[totalAmount]'] + ")\
        ";
        console.log(insertTranscation);
        if (err) throw err;
        sendJsonResponse(res, 200, result);
        client.query(insertTranscation);
        client.end();
    });

};


// GET: localhost:3000/api/portfolio
// TODO: Currently only returns the portfolios that are active
module.exports.getAllPortfolios = function (req, res) {
    var portfolios;
    var query ="\
    SELECT t1.portfolioid AS pId,\
            portfolioname AS pName,\
            userid\
    FROM    portfolios t1\
    WHERE   t1.isActive = true;\
    ";

    client.connect();
    client.query(query, function (err, result) {
        if (err) throw err;
        if (result['rows'] != '[]') {
            result = result['rows'];
            sendJsonResponse(res, 200, result);
            client.end();
        }
    });

};

// E.g. Make POSTS first
// PUT: localhost:3000/api/portfolio/1
// TODO: Not yet migrated to db
module.exports.changePortfolioById = function (req, res) {
    var targetPortfolio = findPortfolioById(req.params.id);
    targetPortfolio.pName = req.body.pName;
    targetPortfolio.userId = req.body.userId;
    sendJsonResponse(res, 200, {
        message : "Changed portfolio",
        portfolio: targetPortfolio
    })

}

// E.g. Make POSTS first
// DELETE: localhost:3000/api/portfolio/1
module.exports.deletePortfolioById = function (req, res) {
    var portfolios;
    var deletePortfolio ="\
    UPDATE PORTFOLIOS\
    SET isActive = FALSE\
    WHERE portfolioid = " + req.params.id + ";\
    ";

    client.connect();
    client.query(deletePortfolio, function (err, result) {
        if (err) throw err;
        sendJsonResponse(res, 200, result);
        client.end();
    });

}
