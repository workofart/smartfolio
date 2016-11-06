# README #

## Things to keep in mind when making API requests: ##

**1. Request Library | The request originates from the server (E.g. /controller/portfolio.js)**

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


**2. AJAX | The request originates from the client (E.g. /javascripts/portfolio_actions.js)**

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



## Quick LOC Summary ##

### Updated (2016/10/29 9:10PM) ###
### 4654 Total ###

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


### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact