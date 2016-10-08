var request = require('request');
var _ = require('underscore');

var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}

var storedPortfolio = [];

// E.g.
// GET: localhost:3000/api/analysis/123
// Return: {
//     "portfolio": {
//         "pId": "123",
//         "pName": "BestPortfolio",
//         "userId": "99"
//     }
// }
module.exports.getPortfolioById = function (req, res){
    var targetPortfolio = findPortfolioById(req.params.id);
    sendJsonResponse(res, 200, {
        portfolio : targetPortfolio
    });
};

//E.g.
// POST: localhost:3000/api/analysis/123
// Return: {
// "message": "Portfolio created",
//     "portfolio": {
//         "pId": "123",
//         "pName": "BestPortfolio",
//         "userId": "99"
//     }
// }
module.exports.createPortfolio = function (req, res) {

    // For all nested objects, must follow req.body['key[subkey]'] to get the value
    var portfolio = {
        pId: req.params.id,
        pName: req.body.pName,
        userId: req.body.userId,
        stock: {
            ticker: req.body['stock[ticker]'],
            quantity: req.body['stock[quantity]'],
            amount: req.body['stock[totalAmount]']
        }
    }

    portfolioIO('portfolio', portfolio);

    sendJsonResponse(res, 200, {
        message: 'Portfolio created',
        portfolio : portfolio
    });

};

// E.g. Make POSTS first
// GET: localhost:3000/api/analysis
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
    sendJsonResponse(res, 200, portfolios);
};

// E.g. Make POSTS first
// PUT: localhost:3000/api/analysis/1
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
// DELETE: localhost:3000/api/analysis/1
// Return:
// {
//     "message": "Portfolio removed"
// }
module.exports.deletePortfolioById = function (req, res) {
    var targetPortfolio = findPortfolioById(req.params.id);
    portfolios = _.without(portfolios, targetPortfolio);
    sendJsonResponse(res, 200, {
        message: "Portfolio removed"
    })
}

function findPortfolioById(id) {
    for (var i = 0; i < portfolios.length; i++) {
        if (portfolios[i].pId == id) {
            return portfolios[i];
        }
    }
}

var fs = require('fs');

function portfolioIO (fileName, newPortfolio) {
    fs.exists(fileName + '.json', function(exists) {
        if (exists) {
            // console.log('file exists');
            fs.readFile(fileName + '.json', 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                }
                var result;
                if (data==""){
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
}

// Utility function for getting the latest pid
// function findLatestPortfolioId(storedPortfolio) {
//     var maxId = 0;
//     for (var i = 0; i < storedPortfolio.length; i++) {
//         console.log(storedPortfolio[i]);
//         if (storedPortfolio[i].pId > maxId){
//             maxId = storedPortfolio[i].pId + 1;
//             console.log('Found maxId: ' + maxId);
//         }
//     }
//     latestPid = maxId;
// }