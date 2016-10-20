var express = require('express');

module.exports = function(passport) {
    var router = express.Router();
    var ctrlMarket = require('../controllers/market');
    var ctrlIndex = require('../controllers/index');
    var ctrlPortfolio = require('../controllers/portfolio');
    var ctrlPortfolioDetail = require('../controllers/portfolio_detail');
    var signupController = require('../controllers/signup');
    var loginController = require('../controllers/login');

    var isAuthenticated = function (req, res, next) {
        if (req.isAuthenticated())
            return next()
        req.flash('accessMessage', 'You have to be logged in to access the page.')
        res.redirect('/')
    }

    /* GET home page. */
    router.get('/', function(req, res, next) { req.session.redirectTo = '/'; next(); }, ctrlIndex.index);
    /* GET Analysis page */
    router.get('/market', function(req, res, next) { req.session.redirectTo = '/market'; next(); }, ctrlMarket.market);
    /* GET Portfolio Overview page */
    router.get('/portfolio', isAuthenticated, ctrlPortfolio.portfolio);

    /* GET Individual Portfolio page */
    router.get('/portfolio/:pid', isAuthenticated, ctrlPortfolioDetail.portfolioDetail);

    /* GET request for getting stock data from Google */
    router.get('/market/GetGoogleFinanceData/', ctrlMarket.GetGoogleFinanceData)
    /* GET request for Yahoo Finance News */
    router.get('/market/GetYahooFinanceNews', ctrlMarket.GetYahooFinanceNews)

    /* GET latest price from Yahoo Finance */
    router.get('/getLatestPrice', ctrlPortfolio.latestPrice);

    /* Login Page */
    router.get('/login', function(req, res) {
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

    return router;
};