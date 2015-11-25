var config = require('./config');
var db = require('./models');

var NODE_ENV = process.env.NODE_ENV || 'development';

var passport = require('./authentication');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var redis = require('redis').createClient(config.redis[NODE_ENV]);
var subscriber = require('redis').createClient(config.redis[NODE_ENV]);

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(session({
    store: new RedisStore(config.redis[NODE_ENV]),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

var routes = require('./routes');
routes(app);

var server = require('http').Server(app);
var io = require('socket.io')(server);

remoteNsp = io.of('/remote');
remoteNsp.on('connection', function(socket) {
    console.log('a student connected');

    socket.on('request question', function(payload) {
        socket.join(payload.courseId);
        redis.get('active-question:' + payload.courseId, function(err, questionId) {
            console.log('get active-question:' + payload.courseId + ': ' + questionId);

            if (questionId === null) return socket.emit('disable');

            var query = (
                'SELECT * FROM Questions q ' +
                'LEFT JOIN MultipleChoices mc ON q.id = mc.QuestionId ' +
                'LEFT JOIN Responses r ON q.id = r.QuestionId AND r.UserUsername = ? ' +
                'WHERE q.id = ?'
            );
            db.sequelize.query(query, {
                replacements: [payload.username, questionId]
            })
            .spread(function(questions, metadata) {
                var question = questions[0];
                if (!question) return socket.emit('disable');
                socket.emit('set question', {
                    text: question.text,
                    type: question.type,
                    mc: [question.aText, question.bText, question.cText, question.dText, question.eText],
                    value: question.value
                });
            });
        });
    });

    socket.on('response', function(payload) {
        var courseId = socket.rooms[1];
        console.log('Answer submitted: courseId=' + courseId + ' payload=' + JSON.stringify(payload));
        var now = new Date();
        redis.get('active-question:' + courseId, function(err, questionId) {
            var query = (
                'INSERT INTO Responses ' +
                '(UserUsername, QuestionId, value, createdAt, updatedAt) ' +
                'VALUES (?, ?, ?, ?, ?) ' +
                'ON DUPLICATE KEY UPDATE value = ?, updatedAt = ?'
            );
            db.sequelize.query(query, {
                replacements: [
                    payload.username, questionId, payload.value, now, now,
                    payload.value, now
                ]
            })
            .then(function() {
                socket.emit('update value', payload.value);
                var query = (
                    'SELECT value, COUNT(*) AS count FROM Responses ' +
                    'WHERE QuestionId = ? GROUP BY value'
                );
                db.sequelize.query(query, {
                    replacements: [questionId]
                })
                .spread(function(counts, metadata) {
                    payload = {};
                    counts.forEach(function(count) {
                        payload[count.value] = count.count;
                    });
                    console.log(payload);
                    instructorNsp.to(courseId).emit('update counts', payload);
                });
            });
        });
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

instructorNsp = io.of('/instructor');
instructorNsp.on('connection', function(socket) {
    console.log('an instructor connected');

    socket.on('initialize', function(courseId) {
        socket.join(courseId);
        redis.get('active-question:' + courseId, function(err, questionId) {
            socket.emit('active question', questionId);
        });
    });

    socket.on('get counts', function(questionId) {
        var query = (
            'SELECT value, COUNT(*) AS count FROM Responses ' +
            'WHERE QuestionId = ? GROUP BY value'
        );
        db.sequelize.query(query, {
            replacements: [questionId]
        })
        .spread(function(counts, metadata) {
            payload = {};
            counts.forEach(function(count) {
                payload[count.value] = count.count;
            });
            console.log(payload);
            socket.emit('update counts', payload);
        });
    });

    socket.on('set active question', function(questionId) {
        var courseId = socket.rooms[1];
        redis.set('active-question:' + courseId, questionId);
    });

    socket.on('disable', function() {
        var courseId = socket.rooms[1];
        redis.del('active-question:' + courseId);
    });
});

subscriber.on('message', function(channel, key) {
    var result = /active-question:(\d+)/.exec(key);
    if (result) {
        var courseId = parseInt(result[1]);
        console.log(courseId);
        remoteNsp.to(courseId).emit('question change');
    }
});

subscriber.subscribe('__keyevent@0__:set');
subscriber.subscribe('__keyevent@0__:del');

db.sequelize.sync()
.then(function(err) {
    server.listen(config.port);
})
.catch(function(err) {
    throw err[0];
});
