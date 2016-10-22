var exec = require('child_process').exec;

var renderTesting = function(req, res) {

    var custom = {
        title: 'Smartfolio Testing Page'
    };

    res.render('testing', custom);
};

module.exports.testing = function(req, res) {
    renderTesting(req, res);
};


module.exports.reloadDB = function (req, res) {
    reloadDB();
}

function reloadDB() {
    var cmd = 'node app_server/configs/setupDB.js';
    exec(cmd, function (error, stdout, stderr) {
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}