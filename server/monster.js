var monsters = {
	events: {}
};

// Eventually will need to move data server side and just pass an ID.
monsters.events.spawnMonster = function(data) {

}

monsters.startListeners = function(socket) {
    //socket.on('spawnMonsterEvent', monsters.events.spawnMonster());
}

exports.monsters = monsters;