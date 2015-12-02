var db = require('../models');

var async = require('async');

module.exports = function(app) {
    app.get('/course/new', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        res.render('new-course');
    });

    app.post('/course', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        if (!req.body.code || !req.body.name || !req.body.section) {
            return res.render('new-course');
        }

        var now = new Date();
        var query = (
            'INSERT INTO Courses (code, name, section, createdAt, updatedAt) ' +
            'VALUES (?, ?, ?, ?, ?)'
        );
        db.sequelize.query(query, {
            replacements: [req.body.code, req.body.name, req.body.section, now, now]
        })
        .spread(function(result, metadata) {
            var now = new Date();
            var query = (
                'INSERT INTO Instructors ' +
                '(UserUsername, CourseId, createdAt, updatedAt) ' +
                'VALUES (?, ?, ?, ?)'
            );
            db.sequelize.query(query, {
                replacements: [req.user.username, result.insertId, now, now]
            })
            .then(function() {
                res.redirect('/course/' + result.insertId);
            });
        });
    });

    app.get('/course/:id', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        var query = (
            'SELECT * FROM Courses ' +
            'LEFT JOIN Questions ON Courses.id = Questions.CourseId ' +
            'JOIN Instructors ON Courses.id = Instructors.CourseId ' +
            'WHERE Courses.id = ? AND Instructors.UserUsername = ?'
        );
        db.sequelize.query(query, {
            replacements: [req.params.id, req.user.username]
        })
        .spread(function(results, metadata) {
            if (results.length === 0) return res.redirect('/');
            var course = {
                id: results[0].CourseId,
                name: results[0].name,
                code: results[0].code,
                section: results[0].section
            };
            console.log(results);
            var questions = results[0].text ? results.map(function(row) {
                return {id: row.id, text: row.text}
            }) : [];
            console.log(questions);
            res.render('course', {
                course: course,
                questions: questions
            });
        });
    });

    app.get('/course/:id/register', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        var now = new Date();
        var query = (
            'INSERT INTO Registrations ' +
            '(UserUsername, CourseId, createdAt, updatedAt) ' +
            'VALUES (?, ?, ?, ?)'
        );
        db.sequelize.query(query, {
            replacements: [req.user.username, req.params.id, now, now]
        })
        .then(function() {
            res.redirect('/remote/' + req.params.id);
        });
    });

    app.get('/course/:id/question/new', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        res.render('new-question', {
            courseId: req.params.id
        });
    });

    app.post('/course/:id/question', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        var now = new Date();
        var query = (
            'INSERT INTO Questions (text, type, createdAt, updatedAt, CourseId) ' +
            'VALUES (?, ?, ?, ?, ?)'
        );
        db.sequelize.query(query, {
            replacements: [req.body.text, 'mc', now, now, req.params.id]
        })
        .spread(function(results, metadata) {
            var questionId = results.insertId;
            var query = (
                'INSERT INTO MultipleChoices ' +
                '(aText, bText, cText, dText, eText, createdAt, updatedAt, QuestionId) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );
            db.sequelize.query(query, {
                replacements: [
                    req.body.aText, req.body.bText, req.body.cText, req.body.dText, req.body.eText,
                    now, now, questionId
                ]
            })
            .then(function() {
                res.redirect('/course/' + req.params.id);
            });
        });
    });

    app.get('/course/:courseId/question/:questionId', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        async.parallel([
            function(callback) {
            var query = (
                'SELECT * FROM Questions, MultipleChoices ' +
                'WHERE Questions.id = MultipleChoices.id ' +
                'AND Questions.id = ? AND Questions.CourseId = ? LIMIT 1'
            );
            db.sequelize.query(query, {
                replacements: [req.params.questionId, req.params.courseId]
            })
            .spread(function(results, metadata) {
                callback(null, results);
            });
        }, function(callback) {
            var query = (
                'SELECT value, COUNT(*) as count FROM Questions, Responses ' +
                'WHERE Questions.id = Responses.QuestionId ' +
                'AND Questions.id = ? ' +
                'GROUP BY value'
            );
            db.sequelize.query(query, {
                replacements: [req.params.questionId]
            })
            .spread(function(results, metadata) {
                callback(null, results);
            });
        }], function(err, results) {
            console.log(results);

            if (results[0].length === 0) {
                return res.sendStatus(404);
            }

            counts = {};
            results[1].forEach(function(count) {
                counts[count.value] = count.count;
            });

            res.render('question', {
                question: results[0][0],
                counts: counts
            });
        });
    });

    app.get('/course/:courseId/question/:questionId/delete', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        var query = 'DELETE FROM Questions WHERE id = ? AND CourseId = ?';
        db.sequelize.query(query, {
            replacements: [req.params.questionId, req.params.courseId]
        })
        .then(function() {
            res.redirect('/course/' + req.params.courseId);
        });
    });

    app.get('/course/:id/panel', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        var query = (
            'SELECT * FROM Courses ' +
            'LEFT JOIN Questions ON Courses.id = Questions.CourseId ' +
            'JOIN Instructors ON Courses.id = Instructors.CourseId ' +
            'WHERE Courses.id = ? AND Instructors.UserUsername = ?'
        );
        db.sequelize.query(query, {
            replacements: [req.params.id, req.user.username]
        })
        .spread(function(results, metadata) {
            if (results.length === 0) return res.redirect('/');
            var course = {
                id: results[0].CourseId,
                name: results[0].name,
                code: results[0].code,
                section: results[0].section
            };
            console.log(results);
            var questions = results[0].text ? results.map(function(row) {
                return {id: row.id, text: row.text}
            }) : [];
            console.log(questions);
            res.render('instructor-panel', {
                course: course,
                questions: questions
            });
        });
    });
};
