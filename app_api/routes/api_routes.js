var express = require('express');
var router = express.Router();

// require the related controller files
var ctrlPortfolio = require('../controllers/portfolio');

// Define routes for Portfolio
router.get('/portfolio/:id', ctrlPortfolio.getPortfolioById);
router.post('/portfolio', ctrlPortfolio.createPortfolio);
router.put('/portfolio/:id', ctrlPortfolio.changePortfolioById);
router.delete('/portfolio/:id', ctrlPortfolio.deletePortfolioById);
router.get('/portfolio', ctrlPortfolio.getAllPortfolios);
router.get('/portfolio/pid/latestPid', ctrlPortfolio.findLatestPortfolioId);
router.post('/portfolio/:id/addStockToPortfolio', ctrlPortfolio.addStockToPortfolio);
module.exports = router;