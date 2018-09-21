import io from 'socket.io-client';
import * as Animation from '../animation';
import { NEW_PLAYER, ALL_PLAYERS, CHAT, KEY_PRESS, MOVE, STOP, REMOVE } from '../constants/player';
import { CLIMB, LEFT, PRONE, RIGHT, JUMP, SPEED } from '../constants/player';
import { FADE_DURATION } from '../constants/config';
import Ability from './ability';

class Player {
    constructor(scene, room, position, data) {
        this.scene = scene;
        this.room = room;
        this.position = position;
        this.socket = io();
        this.players = {};
        this.sprite = data.sprite;
        this.standing = false;
        this.onGround = false;
    }

    create() {
        this.socket.emit(NEW_PLAYER, this.room, this.position, this.sprite);

        this.socket.on(NEW_PLAYER, (data) => {
            this.addPlayer(data.id, data.x, data.y, data.sprite);
        });

        this.socket.on(ALL_PLAYERS, (data) => {
            this.scene.cameras.main.fadeFrom(FADE_DURATION);
            this.scene.scene.setVisible(true, this.room);

            for (let i = 0; i < data.length; i++) {
                this.addPlayer(data[i].id, data[i].x, data[i].y, data[i].sprite);
            }
            this.scene.matter.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
            this.scene.cameras.main.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
            this.scene.cameras.main.startFollow(this.players[this.socket.id], true);

            // Don't remember what this was for.
            this.players[this.socket.id].body.collisionFilter.group = -1;

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

            // Listens for player animation change events.
            this.socket.on('playerAnimationChangeEvent', (playerInfo) => {
                for (var player in this.players) {
                    console.log(player);
                };
                /*for (var i=0; i < this.players.length; i++) {
                    var otherPlayer = self.otherPlayers[i];
                    if (otherPlayer.playerId === playerInfo.playerId) {
                        if (playerInfo.animationFlipX != null) {
                            otherPlayer.flipX = playerInfo.animationFlipX;
                        };
                        otherPlayer.anims.play(playerInfo.animationKey, true);
                    };
                };*/
            });

            this.scene.matter.world.on('collisionstart', function (event, player) {
                var bodyA = event.pairs[0].bodyA;
                var bodyB = event.pairs[0].bodyB;
                var bodyNames = [bodyA.name, bodyB.name];

                // Checks player against ground
                if (bodyNames.includes('playerSprite'), bodyNames.includes('groundLayer')) {
                    this.setOnGround(true);
                }

                // Checks minion vs monsters
                if (bodyNames.includes('minionBody') && bodyNames.includes('monsterBody')) {
                    var data = {};
                    data[bodyA.name] = bodyA.id;
                    data[bodyB.name] = bodyB.id;
                    data['player'] = player.players[this.socket.id];

                    // What data do i need to send?
                    // Monster ID (Will need to move monster stats server side)
                    // Player ID (To get player stats from server)
                    // Ability ID (To get damage algorithm server side)
                    bodyB.ability.emit('abilityHitEvent', data);
                }
            }, this);

            // Not implemented
            //this.registerChat();
        });
    }

    setOnGround(bool) {
        this.onGround = bool;
    }

    addPlayer(id, x, y, sprite) {
        this.players[id] = this.scene.matter.add.sprite(
            x, 
            y, 
            sprite.spriteHeader + '_stand1_0', 
            0, 
            { 'inertia': 'Infinity', 'name': 'playerSprite' }
        );
    }
    
    left() {
        this.standing = false;
        this.players[this.socket.id].setVelocityX(-SPEED);
        Animation.playerWalkLeft(this, this.sprite.spriteHeader);
        this.socket.emit(KEY_PRESS, LEFT, { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    right() {
        this.standing = false;
        this.players[this.socket.id].setVelocityX(SPEED);
        Animation.playerWalkRight(this, this.sprite.spriteHeader);
        this.socket.emit(KEY_PRESS, RIGHT, { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    prone() {
        // Will need to figure out how to modify the hitbox of player sprite for proper prone.
        this.standing = false;
        if (this.onGround) this.players[this.socket.id].setVelocityX(0);
        Animation.playerProne(this, this.sprite.spriteHeader);
    }

    jump() {
        if (this.onGround) {
            this.onGround = false;
            this.standing = false;
            this.players[this.socket.id].setVelocityY(-10);
            Animation.playerJump(this, this.sprite.spriteHeader);
        }

        if (this.onGround == false) {
            this.standing = false;
            Animation.playerJump(this, this.sprite.spriteHeader);
        }
        this.socket.emit(KEY_PRESS, JUMP, { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    stop() {
        this.players[this.socket.id].setVelocityX(0);
        if (!this.standing) {
            Animation.playerStand(this, this.sprite.spriteHeader);
            this.standing = true;
        }
        this.socket.emit(STOP, { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    proneStab() {
        Animation.playerProneStab(this, this.sprite.spriteHeader);
    }

    basicAttack() {
        new Ability(this).basicAttack();
    }
    
    registerChat() {
        /* - Not implemented
        let chat = document.getElementById(CHAT);
        let messages = document.getElementById('messages');

        chat.onsubmit = (e) => {
            e.preventDefault();
            let message = document.getElementById('message');

            this.socket.emit(CHAT, message.value);
            message.value = '';
        };

        this.socket.on(CHAT, (name, message) => {
            messages.innerHTML += `${name}: ${message}<br>`;
            messages.scrollTo(0, messages.scrollHeight);
        });
        */
    }
}

export default Player;
