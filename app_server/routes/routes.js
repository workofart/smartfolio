var express = require('express');
var router = express.Router();
var ctrlMarket = require('../controllers/market');
var ctrlIndex = require('../controllers/index');
var ctrlPortfolio = require('../controllers/portfolio');

/* GET home page. */
router.get('/', ctrlIndex.index);
/* GET Analysis page */
router.get('/market', ctrlMarket.market);
/* GET Portfolio page */
router.get('/portfolio', ctrlPortfolio.portfolio);

/* GET request for getting stock data from Google */
router.get('/market/GetGoogleFinanceData/', ctrlMarket.GetGoogleFinanceData)
/* GET request for Yahoo Finance News */
router.get('/market/GetYahooFinanceNews', ctrlMarket.GetYahooFinanceNews)
module.exports = router; 