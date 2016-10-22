var renderTesting = function(req, res) {

    var custom = {
        title: 'Smartfolio Testing Page'
    };

    res.render('testing', custom);
};

module.exports.testing = function(req, res) {
    renderTesting(req, res);
};