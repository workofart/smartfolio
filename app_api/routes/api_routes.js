var express = require('express');
var router = express.Router();

// require the related controller files
var ctrlAnalysis = require('../controllers/analysis');

// Define routes for analysis route
router.get('/analysis/:id', ctrlAnalysis.getPortfolioById);
router.post('/analysis/:id', ctrlAnalysis.createPortfolio);

module.exports = router;