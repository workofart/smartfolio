var express = require('express');
var router = express.Router();

// require the related controller files
var ctrlPortfolio = require('../controllers/portfolio');
var ctrlTransaction= require('../controllers/transaction');
// var ctrlInsight = require('../controllers/insight');

// Define routes for Portfolio
router.get('/portfolio/:id', ctrlPortfolio.getPortfolioById);
router.post('/portfolio', ctrlPortfolio.createPortfolio);
router.post('/portfoliowithstock', ctrlPortfolio.createPortfolioWithStock);
router.put('/portfolio/:id', ctrlPortfolio.changePortfolioById);
router.delete('/portfolio/:id', ctrlPortfolio.deletePortfolioById);
router.get('/portfolio', ctrlPortfolio.getAllPortfolios);
router.get('/portfolioCount', ctrlPortfolio.portfolioCount);
router.get('/getPriceListByTicker/:ticker', ctrlPortfolio.getPriceListByTicker);
router.get('/portfolio/composition/:pid', ctrlPortfolio.getPortfolioCompositionById);
router.get('/portfolio/bookvalue/:pid', ctrlPortfolio.getPortfolioBookValueById);
router.get('/portfolio/realvalue/:pid', ctrlPortfolio.getPortfolioRealValueById);

router.get('/portfolio/bookvalue/:pid/:date', ctrlPortfolio.getPortfolioBookValueForDateById);
router.get('/portfolio/bookperformance/:pid', ctrlPortfolio.getPortfolioBookPerformance);
router.get('/portfolio/realperformance/:pid', ctrlPortfolio.getPortfolioRealPerformance);
router.get('/portfolio/volume/:pid', ctrlPortfolio.getPortfolioVolume);

router.post('/transaction/buyStock/:id', ctrlTransaction.buyStock);
router.post('/transaction/sellStock/:id', ctrlTransaction.sellStock);
router.get('/transaction/:id', ctrlTransaction.getTransactions);
router.get('/transaction', ctrlTransaction.getAllTransactions);

// router.get('/insight/applyStrategy', ctrlInsight.applyStrategy);

module.exports = router;