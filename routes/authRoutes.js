const express = require('express')
const router = express.Router();
const authController = require('../controllers/authController')
const passport = require('passport')
const User = require('../models/userModel').User;
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local')


// Defining Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, (res, email, password, done) => {
    User.findOne({
        email: email
    }).then(user => {
        if (!user) {
            return done(null, false);
        }

        bcrypt.compare(password, user.password, (err, passwordMatched) => {
            if (err) {
                return err;
            }

            if (!passwordMatched) {
                return done(null, false);
            }

            return done(null, user);
        });

    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


router.route('/register')
    .get(authController.getRegister)
    .post(authController.registerUser)

router.route('/login')
    .get(authController.getLogin)
    .post(passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        session: true
    }), authController.loginUser)

    router.route('/confirm')
        .get(authController.getConfirm)
        .post(authController.confirmToken)


module.exports = router