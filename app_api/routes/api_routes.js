var express = require('express');
var router = express.Router();

// require the related controller files
var ctrlPortfolio = require('../controllers/portfolio');
var ctrlTransaction= require('../controllers/transaction');

// Define routes for Portfolio
router.get('/portfolio/:id', ctrlPortfolio.getPortfolioById);
router.post('/portfolio', ctrlPortfolio.createPortfolio);
router.put('/portfolio/:id', ctrlPortfolio.changePortfolioById);
router.delete('/portfolio/:id', ctrlPortfolio.deletePortfolioById);
router.get('/portfolio', ctrlPortfolio.getAllPortfolios);

router.post('/transaction/:id/buyStock', ctrlTransaction.buyStock);
router.post('/transaction/:id/sellStock', ctrlTransaction.sellStock);
router.get('/transaction/:id', ctrlTransaction.getTransactions);
router.get('/transaction', ctrlTransaction.getAllTransactions);
module.exports = router;