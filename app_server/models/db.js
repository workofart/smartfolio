const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/smartfolio';

const client = new pg.Client(connectionString);
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