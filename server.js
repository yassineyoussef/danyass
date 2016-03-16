
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

var usernames = {numPlayers: 0}


/*socket.on('addtank', function(data) {
	console.log("nouveau tank a rajouter");
	console.log(tanks.length);
	var pos = originatingPositions[tanks.length];
	console.log(pos);
	console.log("x: " + pos.x + ", y: " + pos.y);
	tanks.push(new Tank(pos.x, pos.y, monVraiNom, pos.clr));
	console.log("nouveau tank a ete rajouter");

});*/

io.sockets.on('connection', function (socket) {

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		var nom = "";
		if(usernames.numPlayers > 2) {
			socket.emit('refuse','les 2 joueurs sont la');
			return;
		}
		++usernames.numPlayers;
		//console.log(usernames.numPlayers);
		// echo to client they've connected
		if(usernames.numPlayers == 1) {

			socket.emit('firsttank', {message: username + ' added', tanks: []});
			nom = "Ryu";
		} else if(usernames.numPlayers == 2) {
			socket.emit('secondtank', {});
			socket.broadcast.emit('addtank', 'SERVER','');
			nom = "Ken";
		}
		usernames[nom] = nom;
		// echo globally (all clients) that a person has connected
		// update the list of users in chat, client-side
		//io.sockets.emit('updateusers', usernames);
	});

	socket.on('gauche',function(data) {
		socket.broadcast.emit('enemygauche');
	});

	socket.on('droite', function(data) {
		socket.broadcast.emit('enemydroite');
	});

	socket.on('haut', function(data) {
		socket.broadcast.emit('enemyhaut');
	});

	socket.on('bas',function(data){
		socket.broadcast.emit('enemybas');
	});

	socket.on('tir', function(data) {
		socket.broadcast.emit('enemytir');
	});



	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		//delete usernames[socket.username];
		--usernames.numPlayers;
		// update list of users in chat, client-side
		// echo globally that this client has left
		//socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});