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

client.query('DROP TABLE IF EXISTS stock_daily;');
const query = client.query('CREATE TABLE stock_daily(ticker VARCHAR(8) NOT NULL,' +
                            'name VARCHAR(256) NOT NULL,' +
                            'datetime TIMESTAMP NOT NULL,' +
                            'open MONEY NOT NULL,' +
                            'close MONEY NOT NULL,' +
                            'high MONEY NOT NULL,' +
                            'low MONEY NOT NULL,' +
                            'PRIMARY KEY (ticker, datetime));');

client.query('DROP TABLE IF EXISTS stock_live;');
const query1 = client.query('CREATE TABLE stock_live(ticker VARCHAR(8) NOT NULL,' +
                            'name VARCHAR(256) NOT NULL,' +
                            'datetime TIMESTAMP NOT NULL,' +
                            'price MONEY NOT NULL,' +
                            'PRIMARY KEY (ticker, datetime));');

client.query('DROP TABLE IF EXISTS dw_Historical;');
const query2 = client.query('CREATE TABLE dw_Historical(ticker VARCHAR(8) NOT NULL,' +
                            'name VARCHAR(256) NOT NULL,' +
                            'datetime TIMESTAMP NOT NULL,' +
                            'price MONEY NOT NULL,' +
                            'PRIMARY KEY (ticker, datetime));');

client.query('DROP TABLE IF EXISTS transactions;');
client.query('DROP TABLE IF EXISTS portfolios;');
client.query('DROP TABLE IF EXISTS users;');

client.query('CREATE TABLE users(userid SERIAL,' +
                            'username VARCHAR(32) UNIQUE NOT NULL,' +
                            'password VARCHAR(32) NOT NULL,' +
                            'PRIMARY KEY (userid));');

client.query('CREATE TABLE portfolios(portfolioid SERIAL,' +
                            'userid INTEGER REFERENCES users(userid),' +
                            'portfolioname VARCHAR(32) NOT NULL,' +
                            'PRIMARY KEY (portfolioid));');

client.query('CREATE TABLE transactions(transactionid SERIAL,' +
                            'portfolioid INTEGER REFERENCES portfolios(portfolioid),' +
                            'datetime TIMESTAMP NOT NULL,' +
                            'ticker VARCHAR(8) NOT NULL,' +
                            'quantity INTEGER NOT NULL,' +
                            'price MONEY NOT NULL,' +
                            'PRIMARY KEY (transactionid));');

var Model = require('./models.js');

    Model.Users.create({
      username: 'user',
      password: 'user',
    }).then(function() {
        console.log('finsihed');
        process.exit();
    })
