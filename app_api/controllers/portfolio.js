var request = require('request');
var _ = require('underscore');

var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}

var storedPortfolio = [];

// E.g.
// GET: localhost:3000/api/market/123
// Return: {
//     "portfolio": {
//         "pId": "123",
//         "pName": "BestPortfolio",
//         "userId": "99"
//     }
// }
module.exports.getPortfolioById = function (req, res){

    var targetPortfolio = findPortfolioById(req.params.id, JSON.parse(portfolioIO('portfolio', null, 0)));
    sendJsonResponse(res, 200, {
        portfolio : targetPortfolio
    });
};

//E.g.
// POST: localhost:3000/api/market/123
// Return: {
// "message": "Portfolio created",
//     "portfolio": {
//         "pId": "123",
//         "pName": "BestPortfolio",
//         "userId": "99",
//         "stocks" : [
//              { "ticker" : "AAPL",
//                "quantity" : "100",
//                "amount" : "2000"
//     }
// }
module.exports.createPortfolio = function (req, res) {
    print('body: ' + JSON.stringify(req.body));
    // For all nested objects, must follow req.body['key[subkey]'] to get the value
    var portfolio = {
        pId: req.params.id,
        pName: req.body.pName,
        userId: req.body.userId,
        stocks: [
            {
                ticker: req.body['stocks[ticker]'],
                quantity: req.body['stocks[quantity]'],
                amount: req.body['stocks[totalAmount]']
            }
        ]
    }
    print('portfolio: ' + JSON.stringify(portfolio));
    portfolioIO('portfolio', portfolio, 2);

    sendJsonResponse(res, 200, {
        message: 'Portfolio created',
        portfolio : portfolio
    });

};

// E.g. Make POSTS first
// GET: localhost:3000/api/market
// Return:
// [
//     {
//         "pId": "1",
//         "pName": "BestPortfolio",
//         "userId": "1"
//     },
//     {
//         "pId": "2",
//         "pName": "BestPortfolio",
//         "userId": "2"
//     },
//     {
//         "pId": "3",
//         "pName": "BestPortfolio",
//         "userId": "3"
//     }
// ]
module.exports.getAllPortfolios = function (req, res) {
    var portfolios;

    portfolios = JSON.parse(portfolioIO('portfolio', null, 0));
    sendJsonResponse(res, 200, portfolios)

};

// E.g. Make POSTS first
// PUT: localhost:3000/api/market/1
// With body as follows
// pName : "WorstPortfolio"
// userId : "1000"
// Return:
// {
//     "message": "Changed portfolio",
//     "portfolio": {
//     "pId": "1",
//         "pName": "WorstPortfolio",
//         "userId": "1000"
// }
// }
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
// DELETE: localhost:3000/api/market/1
// Return:
// {
//     "message": "Portfolio removed"
// }
module.exports.deletePortfolioById = function (req, res) {
    var portfolios = JSON.parse(portfolioIO('portfolio', null, 0));
    var targetPortfolio = findPortfolioById(req.params.id, portfolios);
    portfolios = _.without(portfolios, targetPortfolio);

    // Write back the updated portfolio
    portfolioIO('portfolio', portfolios, 1);
    sendJsonResponse(res, 200, {
        message: "Portfolio removed"
    })
}

function findPortfolioById(id, portfolios) {
    for (var i = 0; i < portfolios.length; i++) {
        if (portfolios[i].pId == id) {
            return portfolios[i];
        }
    }
}

var fs = require('fs');



/**
 *
 * @param fileName
 * @param newPortfolio
 * @param IOFlag - 1 for write, 0 for read, 2 for read and write
 */
function portfolioIO (fileName, newPortfolio, IOFlag) {
    // Case 0 (Read)
    if (IOFlag == 0) {
        if (fs.existsSync(fileName + '.json')) {
            var content = fs.readFileSync(fileName + '.json', 'utf8');
            if (content == '') {
                return '[]';
            }
            return content;
        }
        else {
            throw Error('The file ' + fileName + ' doesn\'t exist');
        }
    }
    // Case 1 (Write)
    if (IOFlag == 1) {
        fs.writeFile(fileName + '.json', JSON.stringify(newPortfolio), "utf8");
        return;
    }

    // Case 2 (Read and write)
    if (IOFlag == 2) {
        fs.exists(fileName + '.json', function (exists) {
            if (exists) {
                // console.log('file exists');
                fs.readFile(fileName + '.json', 'utf8', function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    var result;
                    if (data == "") {
                        result = [];
                    }
                    else {
                        result = JSON.parse(data);
                    }

                    result.push(newPortfolio);
                    fs.writeFile(fileName + '.json', JSON.stringify(result), "utf8");
                    // storedPortfolio = JSON.parse(data);
                    // console.log('data: ' + data);
                });
            }
            else {
                // console.log('created new file');
                var result = []
                result.push(newPortfolio);
                fs.writeFile(fileName + '.json', JSON.stringify(result), "utf8");
            }
        });
        return;
    }

    throw Error("Wrong IO Flag");
}

// Utility function for getting the latest pid
module.exports.findLatestPortfolioId = function (req, res) {
    var temp = portfolioIO('portfolio', null, 0);
    var storedPortfolio;
    if (temp != ''){
        storedPortfolio = JSON.parse(temp);
        var maxId = -1;
        for (var i = 0; i < storedPortfolio.length; i++) {
            if (storedPortfolio[i].pId > maxId){
                maxId = Number(storedPortfolio[i].pId) + 1;
                console.log('Found maxId: ' + maxId);
            }
        }
        latestPid = maxId;
        if (storedPortfolio.length == 0){
            latestPid = 1;
        }
        sendJsonResponse(res, 200, {
            pId: latestPid
        });
        return;
    }

    console.log('Undefined');
    sendJsonResponse(res, 200, {
        pId: 1
    });
}

module.exports.addStockToPortfolio = function (req, res) {
    var pId = req.params.id;
    print('pId: ' + pId);
    var portfolios = JSON.parse(portfolioIO('portfolio', null, 0));
    print('portfolios: ' + JSON.stringify(portfolios));
    var targetPortfolio = findPortfolioById(pId, portfolios);
    print('targetPortfolio: ' + targetPortfolio);
    var newStock = {
        ticker: req.body.ticker,
        quantity: req.body.quantity,
        amount: req.body.totalAmount
    }
    print(newStock);
    targetPortfolio.stocks.push(newStock);
    console.log('New portfolio: ' + JSON.stringify(targetPortfolio));
}

function print(content) {
    console.log(content);
}