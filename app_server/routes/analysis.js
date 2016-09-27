var express = require('express');
var router = express.Router();

/* GET home page. */
var renderAnalysis = function(req, res) {
  res.render('analysis', { 
  	title: 'Smartfolio - Analysis'
  });
};

module.exports.analysis = function(req, res) {
	renderAnalysis(req, res);
};
