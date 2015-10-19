var db = require('../models');

module.exports = function(app) {
    app.get('/remote/:id', function(req, res) {
        var query = 'SELECT COUNT(*) as count FROM Courses WHERE id = ?';
        db.sequelize.query(query, {
            replacements: [req.params.id]
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
