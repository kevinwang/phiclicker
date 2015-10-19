var passport = require('../authentication');

module.exports = function(app) {
    app.get('/login', function(req, res) {
        if (req.isAuthenticated()) return res.redirect('/');
        res.render('login');
    });

    app.post('/login', passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

    app.get('/signup', function(req, res) {
        if (req.isAuthenticated()) return res.redirect('/');
        res.render('signup');
    });

    app.post('/signup', passport.authenticate('signup', {
        successRedirect: '/',
        failureRedirect: '/signup'
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};
