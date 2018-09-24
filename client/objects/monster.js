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

class HealthBar {

    constructor (scene, x, y) {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = x;
        this.y = y;
        this.value = 100;
        this.p = 76 / 100;

        this.draw();

        scene.add.existing(this.bar);
    }

    decrease (amount) {
        this.value -= amount;
        if (this.value < 0) {
            this.value = 0;
        }
        this.draw();
        return (this.value === 0);
    }

    draw () {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 80, 9);

        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, 76, 6);

        if (this.value < 30) {
            this.bar.fillStyle(0xff0000);
        } else {
            this.bar.fillStyle(0x00ff00);
        }

        var d = Math.floor(this.p * this.value);
        this.bar.fillRect(this.x + 2, this.y + 2, d, 6);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.draw();
    }

}

class TrainingDummy extends BaseMonster {

    constructor() {
        
    }

}
