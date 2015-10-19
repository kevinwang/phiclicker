var db = require('../models');

var async = require('async');

module.exports = function(app) {
    app.get('/', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        async.parallel([
            function(callback) {
            var query = (
                'SELECT * FROM Instructors, Courses ' +
                'WHERE Instructors.UserUsername = ? ' +
                'AND Instructors.CourseId = Courses.id'
            );
            db.sequelize.query(query, {
                replacements: [req.user.username]
            })
            .spread(function(results, metadata) {
                callback(null, results);
            });
        },
        function(callback) {
            var query = (
                'SELECT * FROM Registrations, Courses ' +
                'WHERE Registrations.UserUsername = ? ' +
                'AND Registrations.CourseId = Courses.id'
            );
            db.sequelize.query(query, {
                replacements: [req.user.username]
            })
            .spread(function(results, metadata) {
                callback(null, results);
            });
        }], function(err, results) {
            console.log(results);
            res.render('home', {
                user: req.user,
                coursesTaught: results[0],
                coursesTaken: results[1]
            });
        });
    });
};
