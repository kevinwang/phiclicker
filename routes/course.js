var db = require('../models');

module.exports = function(app) {
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

    app.get('/course/:courseId/question/:questionId/delete', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        var query = 'DELETE FROM Questions WHERE id = ? AND Questions.CourseId = ?';
        db.sequelize.query(query, {
            replacements: [req.params.questionId, req.params.courseId]
        })
        .then(function() {
            res.redirect('/course/' + req.params.courseId);
        });
    });
};
