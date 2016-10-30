var renderComingSoon = function(req, res) {

    var custom = {
        title: 'Coming Soon'
    };

    res.render('comingSoon', custom);
};

module.exports.comingSoon = function(req, res) {
    renderComingSoon(req, res);
};

