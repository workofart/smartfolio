var model = require('../models/models');

module.exports.login = function(req, res) {
    // Will only reach this point if login is successful

    // Check for req.user for good measure, but this is not required
    if (req.user) {
        var user = req.user.get({
            plain: true
        });
        var userid = user.userid;
        var username = user.username;

        // Find all portfolios belonging to the user
        model.Portfolios.findAll({ 
            where: { 
                isactive : 'true', 
                userid : userid
            }
        }).then(function (portfolios) {
            var ids = [];
            for (var i = 0; i < portfolios.length; i++){
                ids.push(portfolios[i].get({
                    plain: true
                }).portfolioid);
            }

            model.Portfolios.count({
                where: { 
                    isactive : 'true', 
                    userid : userid 
                }
            }).then (function (c) {
                req.session.user = {};
                req.session.user.userid = userid;
                req.session.user.username = username;
                req.session.portfolios = {};
                req.session.portfolios.count = c;
                req.session.portfolios.ids = ids;
                if (req.session.redirectTo) {
                    var link = req.session.redirectTo; 
                    res.redirect(link);
                } else {
                    res.redirect('/');
                }
            });
        });
    } else {
        // Will never be here, but for good measures (?)
        if (req.session.redirectTo) {
            var link = req.session.redirectTo;
            res.redirect(link);
        } else {
            res.redirect('/');
        }
    }
}