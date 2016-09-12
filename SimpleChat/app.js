var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
mongoose = require('mongoose');

var listener = server.listen(3000, function () {
    console.log('Server listening on port ' + listener.address().port);
});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/SimpleChat', function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to MongoDB');
    }
});

var chatSchema = mongoose.Schema({
    name: String,
    msg: String,
    created: {type: Date, default: Date.now()}
});
var Chat = mongoose.model('Message', chatSchema);

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});
app.use('/stylesheet.css', express.static(__dirname + '/stylesheet.css'));


var users = {};

io.sockets.on('connection', function (socket) {
    console.log("Client", socket.id, "connected.");

    var query = Chat.find({});
    query.sort('-created').limit(8).exec(function (err, docs) {
        if (err) throw err;
        console.log("Loading old messages");
        socket.emit('load old messages', docs);
    });

    socket.on('send message', function (data, callback) {
        var msg = data.trim();
        if (msg.substr(0, 3) === '/w ') {
            msg = msg.substr(3);
            var userIndex = msg.indexOf(' ');
            if (userIndex !== -1) {
                var recipient = msg.substr(0, userIndex);
                var msg = msg.substr(userIndex + 1);
                if (recipient in users) {
                    if (recipient === socket.username) {
                        callback("Error! You cannot whisper yourself!");
                        return;
                    }
                    users[recipient].emit('whisper', {msg: msg, name: socket.username});
                    users[socket.username].emit('whisper', {msg: msg, name: socket.username});
                    console.log()
                }
                else {
                    callback("Error! User is not online!");
                }
            } else {
                callback('Error! Please enter a message for your whisper!')
            }
        } else {
            var messageData = {msg: data, name: socket.username};
            var newMessage = new Chat(messageData);
            newMessage.save(function (err) {
                if (err) throw err;
                io.sockets.emit('new message', messageData);
            });
        }
    });

    socket.on('new user', function (data, callback) {
        if (data in users || data == '') {
            console.log("Client", socket.id, "failed to join chat with username:", data);
            callback(false);
        } else {
            callback(true);
            console.log("User", data, "connected - (Client", socket.id, ")");
            socket.username = data;
            users[socket.username] = socket;
            updateUserlist();
            console.log("Users on server", Object.keys(users));

        }
    });

    socket.on('disconnect', function () {
        console.log("User disconnected. - (Client", socket.id, ")");
        if (!socket.username) return;
        delete users[socket.username];
        updateUserlist();
    });
});

function updateUserlist() {
    io.sockets.emit('users', Object.keys(users));
}