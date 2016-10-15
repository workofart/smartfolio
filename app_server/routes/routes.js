var express = require('express');

module.exports = function(passport) {
    var router = express.Router();
    var ctrlMarket = require('../controllers/market');
    var ctrlIndex = require('../controllers/index');
    var ctrlPortfolio = require('../controllers/portfolio');

    var isAuthenticated = function (req, res, next) {
        if (req.isAuthenticated())
            return next()
        req.flash('accessMessage', 'You have to be logged in to access the page.')
        res.redirect('/')
    }

    /* GET home page. */
    router.get('/', ctrlIndex.index);
    /* GET Analysis page */
    router.get('/market', ctrlMarket.market);
    /* GET Portfolio page */
    router.get('/portfolio', isAuthenticated, ctrlPortfolio.portfolio);

    /* GET request for getting stock data from Google */
    router.get('/market/GetGoogleFinanceData/', ctrlMarket.GetGoogleFinanceData)
    /* GET request for Yahoo Finance News */
    router.get('/market/GetYahooFinanceNews', ctrlMarket.GetYahooFinanceNews)

    /* Login Page */
    router.get('/login', function(req, res) {
        res.render('login', { message: req.flash('loginMessage') });
    })
    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    /* Signup Page */
    router.get('/signup', function(req, res) {
        res.render('signup', { message: req.flash('signupMessage') });
    })
    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/portfolio', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    /* Logout */
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};