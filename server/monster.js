var monsters = {
	current = [];
};

monsters.addForNewPlayer = function(socket) {
	socket.emit('createdMonsterEvent', monsters.current);
}

monsters.startListeners = function(socket, io) {
    socket.on('createMonsterEvent', function (monsterId, x, y) {
    	var monster = { id: monsterId, x: x, y: y };
    	monsters.current.push(monster);
    	io.emit('createdMonsterEvent', monster);
    });
}

exports.monsters = monsters;