var renderError = function(req, res) {

    var custom = {
        title: 'You have landed in a no-mans-zone, please check your url again'
    };

    res.render('error', custom);
};

module.exports.error = function(req, res) {
    renderError(req, res);
};

