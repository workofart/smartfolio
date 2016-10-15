var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var Model = require('../models/models.js');

module.exports = function(app, passport) {
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login session

    /* Handle signup process */
    passport.use('local-signup', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, username, password, done) {
            /* Need this? Else nothing will happen */
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
                            password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
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

    passport.use('local-login', new LocalStrategy({
            passReqToCallback: true // allow us to pass back the req
        },
        function(req, username, password, done) {
            Model.Users.findOne({
                where: {
                    'username': username
                }
            }).then(function(user) {
                if (user == null) {
                    return done(null, false, req.flash('loginMessage', 'Incorrect username or password.'));
                }
                
                
                if (bcrypt.compareSync(password, user.password)) {
                    return done(null, user);
                }

                return done(null, false, req.flash('loginMessage', 'Incorrect username or password.'));
            })
        })
    );

    /* Need serialize and deserialize to keep session alive */
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