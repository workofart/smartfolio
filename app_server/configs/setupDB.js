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
client.connect();

client.on('notice', function(msg) {
    console.log("notice: %j", msg);
});
client.on('error', function(error) {
    console.log(error);
});


client.query('DROP TABLE IF EXISTS companies;');
client.query('DROP TABLE IF EXISTS stock_daily;');
client.query('DROP TABLE IF EXISTS stock_live;');
client.query('DROP TABLE IF EXISTS dw_Historical;');
client.query('DROP TABLE IF EXISTS transactions cascade;');
client.query('DROP TABLE IF EXISTS portfolios cascade;');
client.query('DROP TABLE IF EXISTS users;');

const query = client.query('CREATE TABLE stock_daily(insertId SERIAL,' +
                            'ticker VARCHAR(8) NOT NULL,' +
                            // 'name VARCHAR(256) NOT NULL,' +
                            'datetime TIMESTAMP NOT NULL,' +
                            'open MONEY NOT NULL,' +
                            'close MONEY NOT NULL,' +
                            'high MONEY NOT NULL,' +
                            'low MONEY NOT NULL,' +
                            'PRIMARY KEY (insertId));');

const query1 = client.query('CREATE TABLE stock_live(ticker VARCHAR(8) NOT NULL,' +
                            'name VARCHAR(256) NOT NULL,' +
                            'datetime TIMESTAMP NOT NULL,' +
                            'price MONEY NOT NULL,' +
                            'PRIMARY KEY (ticker, datetime));');

const query2 = client.query('CREATE TABLE dw_Historical(ticker VARCHAR(8) NOT NULL,' +
                            'name VARCHAR(256) NOT NULL,' +
                            'datetime TIMESTAMP NOT NULL,' +
                            'price MONEY NOT NULL,' +
                            'PRIMARY KEY (ticker, datetime));');

client.query('CREATE TABLE users(userid SERIAL,' +
                            'username VARCHAR(32) UNIQUE NOT NULL,' +
                            'password TEXT NOT NULL,' +
                            'isActive boolean NOT NULL DEFAULT TRUE,' +
                            'PRIMARY KEY (userid));');

client.query('CREATE TABLE portfolios(portfolioid SERIAL,' +
                            'userid INTEGER REFERENCES users(userid),' +
                            'portfolioname VARCHAR(32) NOT NULL,' +
                            'balance MONEY NOT NULL DEFAULT 0,' +
                            'isActive boolean NOT NULL DEFAULT TRUE ,' +
                            'PRIMARY KEY (portfolioid));');

client.query('CREATE TABLE transactions(transactionid SERIAL,' +
                            'portfolioid INTEGER REFERENCES portfolios(portfolioid),' +
                            'datetime TIMESTAMP NOT NULL,' +
                            'ticker VARCHAR(8) NOT NULL,' +
                            'quantity INTEGER NOT NULL,' +
                            'price MONEY NOT NULL,' +
                            'status INTEGER NOT NULL DEFAULT 0,' +
                            'PRIMARY KEY (transactionid));');

client.query('CREATE TABLE companies(companyid SERIAL,' +
                            'ticker TEXT NOT NULL,' +
                            'name TEXT NOT NULL,' +
                            'exchange TEXT NOT NULL,' +
                            'PRIMARY KEY (companyid));',
             function(err, result) {
                // Load companies in callback, otherwise table may not be created...
                var model = require('../models/models');
                var companyList = require('./companyList.json');
                for (var i = 0; i < companyList.length; i++) {
                    // No need for checking because we drop the table every time, so no duplication
                    model.Companies.create({
                        ticker: companyList[i].ticker,
                        name: companyList[i].companyName,
                        exchange: 'NASDAQ'
                    });
                }
             });

// Password is 1234
client.query("INSERT INTO USERS (USERNAME, PASSWORD) VALUES ('test', '$2a$08$7/AjFJISfFFIQ83vkV9AAeInVmANXU/af0/Nnu4y6xRRHTsOykS8W');");
client.query("INSERT INTO USERS (USERNAME, PASSWORD) VALUES ('test2', '$2a$08$7/AjFJISfFFIQ83vkV9AAeInVmANXU/af0/Nnu4y6xRRHTsOykS8W');");
client.query("INSERT INTO USERS (USERNAME, PASSWORD) VALUES ('test3', '$2a$08$7/AjFJISfFFIQ83vkV9AAeInVmANXU/af0/Nnu4y6xRRHTsOykS8W');");
client.query("INSERT INTO PORTFOLIOS (USERID, portfolioname) VALUES (1, 'BESTportfolio');");
client.query("INSERT INTO PORTFOLIOS (USERID, portfolioname) VALUES (2, 'TESTportfolio');");
// client.query("INSERT INTO STOCK_DAILY (TICKER, NAME, DATETIME, OPEN, CLOSE, HIGH, LOW) VALUES " +
//     "('AAPL', 'APPLE', CURRENT_TIMESTAMP, 10.00, 12.15, 15.23, 8.99);");
client.query("INSERT INTO STOCK_LIVE (TICKER, NAME, DATETIME, price) VALUES " +
    "('AAPL', 'APPLE', CURRENT_TIMESTAMP, 10.00);");
client.query("INSERT INTO dw_historical (TICKER, NAME, DATETIME, price) VALUES " +
    "('AAPL', 'APPLE', CURRENT_TIMESTAMP, 10.00);");
client.query("INSERT INTO transactions (portfolioid, DATETIME, ticker, quantity, price, status) VALUES " +
    "(1, CURRENT_TIMESTAMP, 'AAPL', 100, 10.00, 1);");
client.query("INSERT INTO transactions (portfolioid, DATETIME, ticker, quantity, price, status) VALUES " +
    "(1, CURRENT_TIMESTAMP, 'FB', 100, 30.00, 1);");
client.query("INSERT INTO transactions (portfolioid, DATETIME, ticker, quantity, price, status) VALUES " +
    "(1, CURRENT_TIMESTAMP, 'GOOG', 100, 20.00,1 );");
client.query("INSERT INTO transactions (portfolioid, DATETIME, ticker, quantity, price) VALUES " +
    "(2, CURRENT_TIMESTAMP, 'INTC', 1000, 30.00);");