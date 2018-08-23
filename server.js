var express = require('express');
var app = express();
var playerController = require('./server/controllers/player');
var pm = playerController.playerManager;
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/html/index.html');
});

io.on('connection', function (socket) {
    console.log(socket.id, "CONNECTED");
    // create a new player and add it to our players object
    chararacterList = ["base", "johnny", "shock", "stephen"];

    players[socket.id] = {
      movementData: [],
      playerId: socket.id,
      animationKey: null,
      animationFlipX: null,
      character: chararacterList[randomInt(0, chararacterList.length)],
      stats: pm.stats.new(),
      info: pm.info.new()
    };

    // send the players object to the new player
    socket.emit('currentPlayers', players);

    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', function () {
        // remove this player from our players object
        delete players[socket.id];

        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });

    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
        players[socket.id].movementData = movementData;
        console.log(socket.id, players[socket.id].movementData[0]);
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    // when animation is played broadcast to all players
    socket.on('animationEvent', function(animationKey) {
        players[socket.id].animationKey = animationKey.key;
        players[socket.id].animationFlipX = animationKey.flipX;
        socket.broadcast.emit('playerAnimationChangeEvent', players[socket.id])
    });

    socket.on('updatePlayerStatEvent', function(statData) {

    });

    socket.on('spawnMonster', function(monsterId) {

    });

});

server.listen(process.env.PORT || 8080, function () {
  console.log(`Listening on ${server.address().port}`);
});

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}