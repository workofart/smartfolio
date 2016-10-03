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

router.get('/analysis/GetGoogleFinanceData/', ctrlAnalysis.GetGoogleFinanceData)
// Example URL localhost:3000/analysis/test2?id=3&ticker=fb
router.get('/analysis/test2/', ctrlAnalysis.test2)

module.exports = router;