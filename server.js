
// We need to use the express framework: have a real web servler that knows how to send mime types etc.
var express=require('express');

// Init globals variables for each module required
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

// launch the http server on given port
server.listen(8080);

// Indicate where static files are located. Without this, no external js file, no css...  
app.use(express.static(__dirname + '/'));    

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {numPlayers:0};
var tanks = [];

io.sockets.on('connection', function (socket) {

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username = username;
		if(usernames.numPlayers > 4) {
			socket.emit('refuse','les 4 joueurs sont la');
			return;
		}
		// add the client's username to the global list
		usernames[username] = username;
		++usernames.numPlayers;
		//console.log(usernames.numPlayers);
		// echo to client they've connected
		socket.emit('addtank', {message: username + ' added', tanks: []});
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('addtank', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});