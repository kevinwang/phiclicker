var config = require('./config');
var db = require('./models');

var NODE_ENV = process.env.NODE_ENV || 'development';

var passport = require('./authentication');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

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

var results = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0};

app.get('/', function(req, res) {
    res.render('index');
});

io.on('connection', function(socket) {
    console.log('a user connected');

    function updateClients(classId) {
        io.to(classId).emit('update counts', results);
    }

    socket.on('initialize', function(classId) {
        socket.join(classId);
        socket.emit('update counts', results);
    });

    socket.on('answer', function(value) {
        var classId = socket.rooms[1];
        console.log('Answer submitted: classId=' + classId + ' value=' + value);
        results[value]++;
        updateClients(classId);
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

db.sequelize.sync()
.then(function(err) {
    server.listen(config.port);
})
.catch(function(err) {
    throw err[0];
});
