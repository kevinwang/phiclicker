var db = require('./models');
var bcrypt = require('bcrypt');
var async = require('async');
var _ = require('underscore');

var range = _.range(100);

db.Course.find({
    where: {id: 1}
})
.then(function(course) {
    async.each(range, function(i, callback) {
        bcrypt.hash('password', 10, function(err, hash) {
            db.User.create({
                username: 'student' + i,
                password: hash
            })
            .then(function(user) {
                user.addRegisteredCourse(course);
                callback();
            });
        });
    });
});
