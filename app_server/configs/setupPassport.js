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
            process.nextTick(function() {
                Model.Users.findOne({
                    where: {
                        'username': username
                    }
                }).then(function(user) {
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'The username is already taken.'));
                    } else {

                        var newUser = {
                            username: username,
                            password: password
                        }

                        Model.Users.create(newUser).then(function(newUser2) {
                            console.log(newUser2);
                            return done(null, newUser2);
                        })
                    }
                })
            })
        })
    );

    passport.serializeUser(function(user, done) {
        console.log(user);
        console.log(user.dataValues.userid);
        done(null, user.dataValues.userid);
    });

    passport.deserializeUser(function(id, done) {
        Model.Users.findOne({
            where: {
                'userid': id
            }
        }).then(function (user) {
            if (user == null) {
                done(new Error('Wrong user id.'))
            }
        
            done(null, user);
        });
    });
};