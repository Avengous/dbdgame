var Client = {};
Client.socket = io.connect();

Client.getMonsterData = function() {
    Client.socket.emit('getExistingMonstersEvent');
}

Client.createMonster = function(monsterId, x, y) {
    Client.socket.emit('createMonsterEvent', monsterId, x, y);
}

Client.socket.on('createdMonsterEvent', function(monsters) {
    for (i in monsters) {
        var monster = monsters[i];
        Game.monster.create(monster.id, monster.x, monster.y);
    }
})

//Client.socket.on('createdMonsterEvent', Game.monster.create());

/*
Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.sendClick = function(x,y){
  Client.socket.emit('click',{x:x,y:y});
};

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }

    Client.socket.on('move',function(data){
        Game.movePlayer(data.id,data.x,data.y);
    });

    Client.socket.on('remove',function(id){
        Game.removePlayer(id);
    });
});
*/

