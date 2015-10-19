var config = require('./config');
var db = require('./models');

var NODE_ENV = process.env.NODE_ENV || 'development';

var passport = require('./authentication');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var redis = require('redis').createClient(config.redis[NODE_ENV]);

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('view engine', 'jade');
app.use('/static', express.static('public'));
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

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('initialize', function(payload) {
        socket.join(payload.courseId);
        redis.get('active-question:' + payload.courseId, function(err, questionId) {
            console.log('active-question:' + payload.courseId + ': ' + questionId);

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
            });
        });
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

db.sequelize.sync()
//db.sequelize.sync({force: true})
.then(function(err) {
    //require('./seed-db')();
    server.listen(config.port);
})
.catch(function(err) {
    throw err[0];
});
