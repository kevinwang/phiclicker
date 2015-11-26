var db = require('../models');

var async = require('async');
var _ = require('underscore');

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
                'SELECT * FROM Courses ' +
                'LEFT JOIN (SELECT * FROM Registrations WHERE UserUsername = ?) AS r ' +
                'ON Courses.id = r.CourseId'
            );
            db.sequelize.query(query, {
                replacements: [req.user.username]
            })
            .spread(function(results, metadata) {
                callback(null, results);
            });
        }], function(err, results) {
            allCourses = _.partition(results[1], function(course) {
                // User is registered for course iff UserUsername is not null
                return course.UserUsername !== null;
            });

            res.render('home', {
                user: req.user,
                coursesTaught: results[0],
                coursesTaken: allCourses[0],
                coursesAvailable: allCourses[1]
            });
        });
    });
};
