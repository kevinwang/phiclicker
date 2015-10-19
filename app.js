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

    socket.on('initialize', function(courseId) {
        socket.join(courseId);
        redis.get('active-question:' + courseId, function(err, questionId) {
            console.log('active-question:' + courseId + ': ' + questionId);

            if (questionId === null) return socket.emit('disable');

            var query = (
                'SELECT * FROM Questions LEFT JOIN MultipleChoices ' +
                'ON Questions.id = MultipleChoices.QuestionId ' +
                'WHERE Questions.id = ? '
            );
            db.sequelize.query(query, {
                replacements: [questionId]
            })
            .spread(function(questions, metadata) {
                var question = questions[0];
                socket.emit('set question', {
                    text: question.text,
                    type: question.type,
                    mc: [question.aText, question.bText, question.cText, question.dText, question.eText]
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
