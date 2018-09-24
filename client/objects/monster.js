import io from 'socket.io-client';

class BaseMonster {
    constructor(scene, room, position, data) {
        this.scene = scene;
        this.room = room;
        this.position = position;
        this.socket = io();
        this.sprite = data.sprite;
    }

    create() {
        // Add Monster to Server
        //this.socket.emit(NEW_PLAYER, this.room, this.position, this.sprite);

        // Add Monster to Client
        /*this.socket.on(NEW_PLAYER, (data) => {
            this.addPlayer(data.id, data.x, data.y, data.sprite);
        });*/

        // Play movement, animations and remove monsters from client
        /*this.socket.on(ALL_PLAYERS, (data) => {

            this.socket.on(MOVE, (data) => {
                this.players[data.id].x = data.x;
                this.players[data.id].y = data.y;
                this.players[data.id].anims.play(data.direction, true);
            });

            this.socket.on(STOP, (data) => {
                this.players[data.id].x = data.x;
                this.players[data.id].y = data.y;
                this.players[data.id].anims.stop();
            });

            this.socket.on(REMOVE, (id) => {
                this.players[id].destroy();
                delete this.players[id];
            });
        });*/
    }


    add(id, x, y, sprite) {
        /*
        this.players[id] = this.scene.matter.add.sprite(
            x, 
            y,
            sprite.spriteHeader + '_stand1_0', 
            0, 
            { 'inertia': 'Infinity', 'name': 'playerSprite' }
        );
        */
    }
    
}

class TrainingDummy extends BaseMonster {

    constructor() {
        
    }

}
