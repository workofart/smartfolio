var request = require('request');

var portfolios = [];
var sendJsonResponse = function (res, status, content){
    res.status(status);
    res.json(content);
}


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
    var targetPortfolio;
    for (var i = 0; i < portfolios.length; i++) {
        if (portfolios[i].pId == req.params.id) {
            targetPortfolio = portfolios[i];
        }
    }
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
    var portfolio = {
        pId: req.params.id,
            pName: req.body.pName,
            userId: req.body.userId
    }
    portfolios.push(portfolio);
    sendJsonResponse(res, 200, {
        message: 'Portfolio created',
        portfolio : portfolio
    })
};
