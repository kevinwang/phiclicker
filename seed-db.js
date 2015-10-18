var bcrypt = require('bcrypt');
var db = require('./models');

/**
 * Seed the database with test data.
 */
module.exports = function() {
    bcrypt.hash('password', 10, function(err, hash) {
        db.User.create({
            username: 'kevin',
            password: hash
        })
        .then(function(kevin) {
            db.Course.create({
                code: 'CS 411',
                name: 'Database Systems',
                section: 'Q3'
            })
            .then(function(course) {
                kevin.addInstructedCourse(course);
                bcrypt.hash('password', 10, function(err, hash) {
                    db.User.create({
                        username: 'matthew',
                        password: hash
                    })
                    .then(function(matthew) {
                        matthew.addRegisteredCourse(course);
                    });
                });
            });
        });
    });

    db.Question.create({
        text: 'How many chucks can a wood chuck chuck?',
        type: 'mc'
    })
    .then(function(question) {
        db.MultipleChoice.create({
            aText: 'Aravind is a fuckboi',
            bText: 'Nexus of cheating',
            cText: 'Sunbathing with my doggie',
            dText: 'Lorem Ipsum'
        })
        .then(function(mc) {
            question.setMultipleChoice(mc);
        });
    });
}
