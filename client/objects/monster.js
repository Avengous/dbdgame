import io from 'socket.io-client';
import { JSON_MONSTER_DATA, HEADER_MONSTER_SPRITE } from '../constants/keys';
import { NEW_MONSTER, ALL_MONSTERS, MOVE, STOP, REMOVE } from '../constants/monsters';
import { LEFT, RIGHT, JUMP, SPEED } from '../constants/monsters';
import { randomInt } from '../../utilities/math.js';

export class Monster {
    constructor(scene, room, position, id) {
        this.id = id.toString();
        this.scene = scene;
        this.room = room;
        this.position = position;
        this.socket = io();
        this.data = this.scene.cache.json.get(JSON_MONSTER_DATA)[this.id];
        this.monsters = {};
        this.eventCnt = 0;
        this.eventCur;
    }

    create() {
        // Add Monster to Server
        this.socket.emit(NEW_MONSTER, this.room, this.position, this.id, this.data);
        
        // Add Monster to Client
        this.socket.once(NEW_MONSTER, (data) => {
            this.add(data);
        });

        // Play movement, animations and remove monsters from client

        /*
            Instead of creating this listener on monster creation... it really needs to be on the scene creation.
        */

        this.socket.on(ALL_MONSTERS, (data) => {

            for (let i = 0; i < data.length; i++) {
                this.add(data[i]);
            }

            this.socket.on(MOVE, (data) => {
                console.log(this.monsters);
                switch(data.direction) {
                    case LEFT:
                        this.monsters[data.id].setVelocityX(-SPEED);
                        this.monsters[data.id].flipX = false;
                        this.monsters[data.id].anims.play('monsterAnim_' + data.monsterId + '_walk');
                        break;
                    case RIGHT:
                        this.monsters[data.id].setVelocityX(SPEED);
                        this.monsters[data.id].flipX = true;
                        this.monsters[data.id].anims.play('monsterAnim_' + data.monsterId + '_walk');
                        break;
                }
            });

            this.socket.on(STOP, (data) => {
                this.monsters[data.id].setVelocityX(0);
                this.monsters[data.id].anims.play('monsterAnim_' + data.monsterId + '_stand');
            });

            this.socket.on(REMOVE, (data) => {
                // Need to figure out how to kill a monster...
                //console.log('Remove Event', this.monsters[data.id])
                this.monsters[data.id].hp = 0;
                this.monsters[data.id].setActive(false);
                this.monsters[data.id].setVisible(false);
                delete this.monsters[data.id];
            });
        });
    }


    add(data) {
        if (this.monsters == undefined) 
            console.log('found und')
            this.monsters = {};

        var monster = this.scene.matter.add.sprite(
            data.x,
            data.y,
            HEADER_MONSTER_SPRITE + data.monsterId,
            0,
            { 'inertia': 'Infinity', 'name': data.data.name });
        monster.body.collisionFilter.group = -1;
        monster.body.name = 'monsterBody';
        monster.anims.play('monsterAnim_' + data.monsterId + '_stand');
        monster.hp = new HealthBar(this.scene, 0, 0);
        monster.hp.setPosition(monster.x-(monster.width/2), monster.y-(monster.height*0.7));
        monster.monsterId = data.id;
        this.monsters[data.id] = monster;
        this.scene.time.addEvent({ delay: 100, callback: this.randomEvent, callbackScope: this, loop: true, args: [this.monsters[data.id]] });
    }

    update(monster) {
        monster.hp.setPosition(monster.x-(monster.width/2), monster.y-(monster.height*0.7));
    }

    left(monster) {
        this.socket.emit(MOVE, LEFT, monster);
    }

    right(monster) {
        this.socket.emit(MOVE, RIGHT, monster);
    }

    stop(monster) {
        this.socket.emit(STOP, monster);
    }

    randomEvent(monster) {
        if (this.eventCnt == 10) {
            this.eventCnt = 0;
            this.eventCur = randomInt(0, 3);
        }

        switch(this.eventCur) {
            case 0:
                this.stop(monster);
                break;
            case 1:
                this.left(monster);
                break;
            case 2:
                this.right(monster);
                break;
        }

        this.eventCnt++;
    }

    getPosition(monster) {
        return { x: monster.x, y: monster.y };
    }

    destroy(monster) {
        this.socket.emit(REMOVE, monster);
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
