var express = require('express');
var router = express.Router();

// require the related controller files
var ctrlAnalysis = require('../controllers/analysis');

// Define routes for analysis route
router.get('/analysis/:id', ctrlAnalysis.getPortfolioById);
router.post('/analysis/:id', ctrlAnalysis.createPortfolio);
router.put('/analysis/:id', ctrlAnalysis.changePortfolioById);
router.delete('/analysis/:id', ctrlAnalysis.deletePortfolioById);
router.get('/analysis', ctrlAnalysis.getAllPortfolios);
router.get('/portfolio/latestPid', ctrlAnalysis.findLatestPortfolioId);
module.exports = router;