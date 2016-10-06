var express = require('express');
var router = express.Router();
var ctrlAnalysis = require('../controllers/analysis');
var ctrlIndex = require('../controllers/index');
var ctrlPortfolio = require('../controllers/portfolio');

/* GET home page. */
router.get('/', ctrlIndex.index);
/* GET Analysis page */
router.get('/analysis', ctrlAnalysis.analysis);
/* GET Portfolio page */
router.get('/portfolio', ctrlPortfolio.portfolio);

/* GET request for getting stock data from Google */
router.get('/analysis/GetGoogleFinanceData/', ctrlAnalysis.GetGoogleFinanceData)
/* GET request for Yahoo Finance News */
router.get('/analysis/GetYahooFinanceNews', ctrlAnalysis.GetYahooFinanceNews)
module.exports = router; 