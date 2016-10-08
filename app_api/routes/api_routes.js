var express = require('express');
var router = express.Router();

// require the related controller files
var ctrlPortfolio = require('../controllers/portfolio');

// Define routes for analysis route
router.get('/portfolio/:id', ctrlPortfolio.getPortfolioById);
router.post('/portfolio/:id', ctrlPortfolio.createPortfolio);
router.put('/portfolio/:id', ctrlPortfolio.changePortfolioById);
router.delete('/portfolio/:id', ctrlPortfolio.deletePortfolioById);
router.get('/portfolio', ctrlPortfolio.getAllPortfolios);
router.get('/portfolio/latestPid', ctrlPortfolio.findLatestPortfolioId);

module.exports = router;