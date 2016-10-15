var bcrypt = require('bcrypt-nodejs');
var Model = require('../models/models.js');

module.exports.signup = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var error = false;

    if (!username || !password || !password2) {
        req.flash('signupMessage', 'Please fill in all the fields');
        error = true;
        return res.redirect('/signup');
    }

    if (password !== password2) {
        req.flash('signupMessage', 'Please enter the same password twice');
        error = true;
        return res.redirect('/signup');
    }

    if (error === false) {
        Model.Users.findOne({
            where: {
                'username': username
            }
        }).then(function(user) {
            if (user) {
                req.flash('signupMessage', 'The username is already taken.');
                res.redirect('/signup');
            } else {
                var newUser = {
                    username: username,
                    password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
                }

                Model.Users.create(newUser).then(function() {
                    return res.redirect('/');
                })
            }
        })
    }
}