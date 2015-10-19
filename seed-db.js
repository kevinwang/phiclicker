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

                db.Question.create({
                    text: 'How many chucks can a wood chuck chuck?',
                    type: 'mc'
                })
                .then(function(question) {
                    question.setCourse(course);
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

                db.Question.create({
                    text: 'At what time is CS 411 lecture held?',
                    type: 'mc'
                })
                .then(function(question) {
                    question.setCourse(course);
                    db.MultipleChoice.create({
                        aText: '2:00 pm',
                        bText: '2:30 pm',
                        cText: '3:00 pm',
                        dText: '3:30 pm',
                        eText: '4:00 pm'
                    })
                    .then(function(mc) {
                        question.setMultipleChoice(mc);
                    });
                });
            });
        });
    });
}
