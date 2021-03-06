var express = require('express');

module.exports = function(passport) {
    var router = express.Router();
    var ctrlMarket = require('../controllers/market');
    var ctrlMFMarket = require('../controllers/mfMarket');
    var ctrlIndex = require('../controllers/index');
    var ctrlPortfolio = require('../controllers/portfolio');
    var ctrlPortfolioDetail = require('../controllers/portfolio_detail');
    var signupController = require('../controllers/signup');
    var loginController = require('../controllers/login');
    var ctrlTesting = require('../controllers/testing');
    var ctrlComingSoon = require('../controllers/comingSoon');
    var ctrlInsight = require('../controllers/insight');
    var ctrlError = require('../controllers/error');

    var isAuthenticated = function (req, res, next) {
        if (req.isAuthenticated())
            return next()
        req.flash('accessMessage', 'You have to be logged in to access the page.')
        res.redirect('/')
    }

    /* GET home page. */
    router.get('/', function(req, res, next) { req.session.redirectTo = '/'; next(); }, ctrlIndex.index);
    /* GET Stock Market page */
    router.get('/market', function(req, res, next) { req.session.redirectTo = '/market'; next(); }, ctrlMarket.market);

    /* GET Mutual Fund Market page */
    router.get('/mutualFundMarket', function(req, res, next) { req.session.redirectTo = '/mutualFundMarket'; next(); }, ctrlMFMarket.mfMarket);

    /* GET Testing page */
    router.get('/testing', function(req, res, next) { req.session.redirectTo = '/testing'; next(); }, ctrlTesting.testing);
    router.get('/testing/withDates', ctrlTesting.testingDiffDates);
    router.get('/testing/reloadDB', ctrlTesting.reloadDB);

    /* GET Insight page */
    router.get('/insight', ctrlComingSoon.comingSoon);


    /* GET Learn more page */
    router.get('/learnmore', ctrlComingSoon.comingSoon);

    /* GET Portfolio Overview page */
    router.get('/portfolio', isAuthenticated, ctrlPortfolio.portfolio);

    /* GET Individual Portfolio page */
    router.get('/portfolio/:pid', isAuthenticated, ctrlPortfolioDetail.portfolioDetail);

    /* GET request for getting stock data from Google */
    router.get('/market/GetGoogleFinanceData/', ctrlMarket.GetGoogleFinanceData);
    /* GET request for Yahoo Finance News */
    router.get('/market/GetYahooFinanceNews', ctrlMarket.GetYahooFinanceNews);
    /* GET request for companies in Database */
    router.get('/market/GetCompanyList', ctrlMarket.GetCompanyList);
    /* GET request for mutual funds in Database */
    router.get('/market/GetMutualFundList', ctrlMarket.GetMutualFundList);

    /* GET latest price from Yahoo Finance */
    router.get('/getLatestPrice', ctrlPortfolio.latestPrice);

    router.post('/insight/getUpperBound', ctrlInsight.getUpperBound);
    router.post('/insight/getLowerBound', ctrlInsight.getLowerBound);
    router.get('/insight/dynamicMovingAverage/:ticker', ctrlInsight.dynamicMovingAverage);

    /* Login Page */
    router.get('/login', function(req, res) {
        if (req.query.redirectTo) {
            req.session.redirectTo = '/' + req.query.redirectTo;
        } else {
            req.session.redirectTo = '/';
        }
        res.render('login', { message: req.flash('loginMessage') });
    })
    router.post('/login', passport.authenticate('local-login', {
        // Don't set successRedirect. When login succeeds, will be caught by 2nd callback
        // successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }), loginController.login);

    /* Signup Page */
    router.get('/signup', function(req, res) {
        res.render('signup', { message: req.flash('signupMessage') });
    })
    router.post('/signup', signupController.signup);

    /* Logout */
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    /* GET Error page for all unknow url */
    // router.get('/*', ctrlError.error);


    return router;
};