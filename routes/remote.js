var db = require('../models');

module.exports = function(app) {
    app.get('/remote/:id', function(req, res) {
        if (!req.isAuthenticated()) return res.redirect('/login');
        var query = (
            'SELECT COUNT(*) as count FROM Registrations ' +
            'WHERE CourseId = ? AND UserUsername = ?'
        );
        db.sequelize.query(query, {
            replacements: [req.params.id, req.user.username]
        })
        .spread(function(results, metadata) {
            if (results[0].count === 0) return res.redirect('/');
            res.render('remote', {
                id: req.params.id,
                username: req.user.username
            });
        });
    });
};
