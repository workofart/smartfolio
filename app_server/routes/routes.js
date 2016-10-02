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

module.exports = router;