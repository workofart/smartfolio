# Smartfolio - Stock Trading Simulator
> Note that due to the [discontinuation of Yahoo Finance API](https://forums.yahoo.net/t5/Yahoo-Finance-help/Is-Yahoo-Finance-API-broken/m-p/251312/highlight/true#M3123) in 2017, combined with the stale development of this project, you will **not** be able to **build/run** this project locally. However, a live demo is still available [here](https://gentle-oasis-41659.herokuapp.com/) (without prices obviously)

## Screenshot
![Screenshot](https://raw.githubusercontent.com/workofart/personal-page/master/public/img/smartfolio.png)


## ~~Installing~~  (Removed due to Yahoo Finance API being discontinued)


### Initial Configuration (Assuming DB is initialized)

1. Before developing/using this project, make sure to modify the [DB Configs](https://github.com/workofart/smartfolio/blob/master/app_server/configs/setupDB.js)  accordingly.

2. Then, run this [script](https://github.com/workofart/smartfolio/blob/master/app_server/configs/sql_scripts/LoadSQLFiles.py) to populate the DB with some [pre-defined functions](https://github.com/workofart/smartfolio/tree/master/app_server/configs/sql_scripts).


## Developing

Pre-dev house-keeping

```shell
git clone https://github.com/workofart/smartfolio.git
cd smartfolio/
npm install
```

### Building

Since we used Jade/Pug as the template engine, building is not needed.

## Features

Stock-trading simulator
* Market analysis (stock price graphs, historical prices, news for selected stocks)
* Portfolio analysis (Portfolio Composition, Transactions, Performance)
* User system (registration, login)


## Contributing

This repository has been stale since December 2016, and it has been used as a practice project for [Ben](https://github.com/belinghy) and [I](https://github.com/workofart) to get familiar with web technologies. We are no longer maintaining it.

## Links

- Project homepage: https://gentle-oasis-41659.herokuapp.com/
- Repository: https://github.com/workofart/smartfolio
- Related projects:
  - Cryptocurrency Trading Bot: https://github.com/workofart/bit-trader
  - Ben's Repositories: https://github.com/belinghy


## Licensing

The code in this project is licensed under MIT license.


## Little tip learned

**1. Using the [Request](https://github.com/request/request) Library | The request originates from the server (E.g. /controller/portfolio.js)**

url - must append 'http://localhost:3000' as the prefix

qs (query string) - don't need to JSON.stringify()

* E.g. qs: { attr: ['close', 'open'] }


```
request (

        requestOptions,

        function(err, response, body) {

            if (response.statusCode === 200) {

                sendJsonResponse(res, 200, JSON.parse(body));

            } else {

                throw err;

            }

        }

    );
```


**2. Using [jQuery](https://github.com/jquery/jquery)'s ajax | The request originates from the client (E.g. /javascripts/portfolio_actions.js)**

url - can start with /api or /market etc...

params (query string) - must use JSON.stringify() to convert params

* E.g. params: { attr: JSON.stringify(attr) },

```
$.ajax({
        requestOptions,
        success: function (data) {
            // Do stuff with data
        },
        error: function(e) {
            throw e;
        }
 });

```

## Quick LOC Summary

### Updated (2016/10/29 9:10PM)
### 4654 Lines Total

* 114 ./app.js
* 516 ./app_api/controllers/portfolio.js
* 154 ./app_api/controllers/transaction.js
* 30 ./app_api/routes/api_routes.js 
* 83 ./app_server/configs/cron_PopulateStockDaily.js
* 79 ./app_server/configs/cron_PopulateStockLive.js
* 16 ./app_server/configs/sequelize.js
* 118 ./app_server/configs/setupDB.js
* 82 ./app_server/configs/setupPassport.js
* 28 ./app_server/configs/sql_scripts/GetPortfolioBookPerformanceById.sql
* 44 ./app_server/configs/sql_scripts/GetPortfolioBookValueById.sql
* 29 ./app_server/configs/sql_scripts/GetPortfolioBookValueForDateById.sql
* 28 ./app_server/configs/sql_scripts/GetPortfolioCompositionByID.sql
* 21 ./app_server/configs/sql_scripts/GetPortfolioRealValueById.sql
* 74 ./app_server/configs/sql_scripts/GetPortfolioRealValueForDateById.sql
* 67 ./app_server/configs/sql_scripts/GetPortfolioRealValuePerformanceById.sql
* 73 ./app_server/configs/sql_scripts/GetPortfolioTransactionsVolumneById.sql
* 14 ./app_server/configs/sql_scripts/LoadSQLFiles.py  
* 36 ./app_server/controllers/common.js
* 30 ./app_server/controllers/index.js
* 61 ./app_server/controllers/login.js
* 195 ./app_server/controllers/market.js
* 46 ./app_server/controllers/portfolio.js
* 62 ./app_server/controllers/portfolio_detail.js
* 42 ./app_server/controllers/signup.js
* 53 ./app_server/controllers/testing.js
* 24 ./app_server/models/companies.js
* 25 ./app_server/models/models.js
* 30 ./app_server/models/portfolio.js
* 36 ./app_server/models/stockDaily.js
* 36 ./app_server/models/transaction.js
* 24 ./app_server/models/users.js
* 74 ./app_server/routes/routes.js  
* 6 ./app_server/views/error.jade
* 40 ./app_server/views/header.jade
* 41 ./app_server/views/index.jade
* 18 ./app_server/views/layout.jade
* 29 ./app_server/views/login.jade
* 95 ./app_server/views/market.jade
* 48 ./app_server/views/portfolio.jade
* 166 ./app_server/views/portfolio_detail.jade
* 32 ./app_server/views/signup.jade
* 19 ./app_server/views/testing.jade
* 798 ./public/javascripts/market_actions.js
* 665 ./public/javascripts/portfolio_actions.js
* 44 ./public/javascripts/testing_actions.js
* 215 ./public/stylesheets/chart.css
* 23 ./public/stylesheets/portfolio_detail.css
* 71 ./public/stylesheets/style.css

