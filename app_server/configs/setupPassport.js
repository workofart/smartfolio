var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var Model = require('../models/models.js');

module.exports = function(app, passport) {
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login session

    passport.use('local-signup', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, username, password, done) {
            console.log("DEBUG");
            process.nextTick(function() {
                Model.Users.findOne({
                    where: {
                        'username': username
                    }
                }).then(function(user) {
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'The username is already taken.'));
                    } else {
                        Model.Users.create({
                            username: username,
                            password: password,
                        }).then(function(newUser) {
                            return done(null, newUser);
                        })
                    }
                })
            })
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Model.User.findOne({
            where: {
                'id': id
            }
        }).then(function (user) {
            if (user == null) {
                done(new Error('Wrong user id.'))
            }
        
            done(null, user);
        });
    });
};