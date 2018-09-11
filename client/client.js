import { Game } from './game.js'

export var Client = {};
Client.socket = io.connect();

Client.getMonsterData = function() {
    Client.socket.emit('getExistingMonstersEvent');
}

Client.createMonster = function(monsterId, x, y) {
    Client.socket.emit('createMonsterEvent', monsterId, x, y);
}

Client.socket.on('createdMonsterEvent', function(monsters) {
    for (var i in monsters) {
        var monster = monsters[i];
        Game.monster.create(monster.id, monster.x, monster.y);
    }
})