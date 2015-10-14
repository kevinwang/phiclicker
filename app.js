var express = require('express');
var app = express();
app.set('view engine', 'jade');
app.use('/static', express.static('public'));

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.get('/', function(req, res) {
    res.render('index');
});

io.on('connection', function(socket) {
    console.log('a user connected');
});
