import * as anim from './animation.js';
import { setPlayerStats, Ability } from './player.js';
import { Client } from './client.js';

export var Game = {};
export var player;
var cursors;
var sprites ;
export var playerCharacter;
var standing;
var onGround;
var playerStats;
const { SPACE, LEFT, RIGHT, UP, DOWN, Q, W, E, R } = Phaser.Input.Keyboard.KeyCodes;

var buffered_movementData = {
    'lastSent': new Date().getTime(), 
    'movementData': []
};

var queuedMovementEvents = {};

Game.init = function(){
    Game.monsterData = this.cache.json.get('monsterDataJson');
    Game.main = this;
};

Game.preload = function() {
    sprites = [
        "base",
        "johnny",
        "shock",
        "stephen"
    ]

    for (var i=0; i < sprites.length; i++) {
        this.load.pack(sprites[i], "assets/json/characters.json", sprites[i]);
    }

    // Load Monster Sprites. Json doesn't work in preload so will have to hard code.
    this.load.spritesheet('monsterSprite_0', 'assets/monster/0.png', { frameWidth: 90, frameHeight: 100 , margin: 4 });

    this.load.tilemapTiledJSON('map', 'assets/json/icyfield.json');
    this.load.image('floor', 'assets/world/icyfield.png');

    this.load.audio('bgm', ['assets/sfx/bgm.m4a']);
};

Game.create = function(){
    var self = this;
    this.socket = io();
    Client.getMonsterData();
    var bgm = this.sound.add('bgm');
    bgm.pauseOnBlur = false;
    bgm.play();

    bgm.on('ended', function() {
        bgm.play();
    });

    var map = this.add.tilemap('map');
    //var map = this.make.tilemap({ key: 'map' });

    //  Now add in the tileset. Tiled Tileset name and preloaded associated image.
    var tiles = map.addTilesetImage('icyfieldTileset', 'floor');

    //  Create our layers, Tiled LayerName
    var groundLayer = map.createStaticLayer('GroundLayer', tiles, 0, 0);
    map.createStaticLayer('Background', tiles,0,0);

    // Everything will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);
    
    // set the boundaries of our game world
    this.matter.world.setBounds(0, 0, groundLayer.width, groundLayer.height);

    // set collision on groundLayer
    groundLayer.setCollisionByProperty({ collides: true });

    var world = this.matter.world.convertTilemapLayer(groundLayer, {'name': 'groundLayer'});

    this.otherPlayers =[];
    this.monsters = []; // Not used i think

    // Adds current player and other previously connected players to game on connect
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                player = addPlayer(self, players[id]);
                playerStats = setPlayerStats(players[id]);
                //playerUi = createPlayerStatUI(self, players[id]);
                self.cameras.main.startFollow(player);
                //self.cameras.main.setDeadzone(50, 500);
                //self.cameras.main.setBounds(500,500);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    // Add new players to game
    this.socket.on('newPlayer', function (playerInfo) {
        //addOtherPlayers(self, playerInfo);
    });

    // Remove player from game on disconnect
    this.socket.on('disconnect', function (playerId) {
        for (var i=0; i < self.otherPlayers.length; i++) {
            otherPlayer = self.otherPlayers[i];
            if (otherPlayer.playerId === playerId) {
                otherPlayer.destroy();
            };
        };
    });

    // Listens for player animation change events.
    this.socket.on('playerAnimationChangeEvent', function (playerInfo) {
        for (var i=0; i < self.otherPlayers.length; i++) {
            otherPlayer = self.otherPlayers[i];
            if (otherPlayer.playerId === playerInfo.playerId) {
                if (playerInfo.animationFlipX != null) {
                    otherPlayer.flipX = playerInfo.animationFlipX;
                };
                otherPlayer.anims.play(playerInfo.animationKey, true);
            };
        };
    });

    this.matter.world.on('collisionstart', function (event, player) {
        var bodyA = event.pairs[0].bodyA;
        var bodyB = event.pairs[0].bodyB;
        var bodyNames = [bodyA.name, bodyB.name];

        // Checks player against ground
        if (bodyNames.includes('playerSprite'), bodyNames.includes('groundLayer')) {
            onGround = true;
        }

        // Checks minion vs monsters
        if (bodyNames.includes('minionBody') && bodyNames.includes('monsterBody')) {
            var data = {};
            data[bodyA.name] = bodyA.id;
            data[bodyB.name] = bodyB.id;
            data['player'] = player;

            // What data do i need to send?
            // Monster ID (Will need to move monster stats server side)
            // Player ID (To get player stats from server)
            // Ability ID (To get damage algorithm server side)
            bodyB.ability.emit('abilityHitEvent', data);
        }
    }, this.player);

    // Listens for other player movement events from server and moves them on client.
    this.socket.on('playerMoved', function (playerInfo) {
        for (var i=0; i < self.otherPlayers.length; i++) {
            otherPlayer = self.otherPlayers[i];
            if (otherPlayer.playerId === playerInfo.playerId) {
                // This will only move players if the previous movements have been completed. Will this lock it?
                // Next step will add a time check where it will force sync the players if too much time has elapsed.
                if (queuedMovementEvents[otherPlayer.playerId].length == 0) {
                    for (var i=0; i < playerInfo.movementData.length; i++) {
                        queuedMovementEvents[otherPlayer.playerId].push(playerInfo.movementData[i]);
                    };
                    moveOtherPlayer(otherPlayer);
                }
            };
        };
    });

    createSpriteAnimations(self, this.cache.json);
    Game.monster.createAnimations(this);
    
    // Player Controls
    cursors = this.input.keyboard.addKeys({
        space: SPACE,
        left: LEFT,
        right: RIGHT,
        up: UP,
        down: DOWN,
        q: Q,
        w: W,
        e: E,
        r: R
    });

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

};

Game.update = function(time, delta) {
    if (this.player) {
        // Sends player movement to server.
        var x = this.player.x;
        var y = this.player.y;

        var currTime = new Date().getTime();
        var timeDiff = currTime - buffered_movementData['lastSent'];

        if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
            buffered_movementData['movementData'].push({ x: this.player.x, y: this.player.y, t: new Date().getTime()})

            //this.player.hp.setPosition(x-(this.player.width), y-(this.player.height));

            // Send movementData every 100ms (timeDiff == 100)
            // I removed the delay. In order to interpolate I would need to interprete velocity.
            if (true) {
                buffered_movementData['lastSent'] = currTime;
                this.socket.emit('playerMovement', buffered_movementData['movementData']);
                buffered_movementData['movementData'] = [];
            }
        }

        this.player.oldPosition = {
            x: this.player.x,
            y: this.player.y,
        };

        // Player Left/Right/Idle Movement
        if (cursors.left.isDown) {
            standing = false;
            this.player.setVelocityX(-5);
            anim.playerWalkLeft(this, playerCharacter);
        } else if (cursors.right.isDown) {
            standing = false;
            this.player.setVelocityX(5);
            anim.playerWalkRight(this, playerCharacter);
        } else {
            this.player.setVelocityX(0);
            if (!standing) {
                anim.playerStand(this, playerCharacter);
                standing = true;
            }
        }

        // Player Jump Movement
        if (Phaser.Input.Keyboard.JustDown(cursors.space) && onGround && !cursors.down.isDown) {
            onGround = false;
            standing = false;
            this.player.setVelocityY(-10);
        }

        // Player Jump Animation
        if (onGround == false) {
            standing = false;
            anim.playerJump(this, playerCharacter);
        }
        
        // Player Prone Movement
        if (cursors.down.isDown) {   
            standing = false;
            if (onGround) this.player.setVelocityX(0);
            anim.playerProne(this, playerCharacter);
        }

        // Basic Attack
        if (cursors.q.isDown && !anim.ANIMATION_LOCK) {
            if (cursors.down.isDown) {
                anim.playerProneStab(this, playerCharacter);
            } else {
                new Ability(this).basicAttack();
            }
        }
    }

    if (this.monsters) {
        for (var i=0; i<this.monsters.length; i++) {
            // Update position of monster health bar
            this.monsters[i].hp.setPosition(this.monsters[i].x-(this.monsters[i].width*0.5), this.monsters[i].y-(this.monsters[i].height*0.70));
        }
    }
};

// Add Player's Character
function addPlayer(self, playerInfo) {
    playerCharacter = playerInfo.character;
    self.player = self.matter.add.sprite(
        400,
        300, 
        playerInfo.character + '_stand1_0', 
        0, 
        {'inertia': 'Infinity',
         'name': 'playerSprite'
        }
    );
    self.player.body.collisionFilter.group = -1;
    return self.player;
};

// Add Other Player's Sprites
function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.matter.add.sprite(
        400,
        300, 
        playerInfo.character + '_stand1_0', 
        0, 
        {'inertia': 'Infinity', 'name': 'playerSprite'}
    );
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.body.collisionFilter.group = -1;
    queuedMovementEvents[playerInfo.playerId] = [];
    self.otherPlayers.push(otherPlayer);
};

// Create animations for sprites from JSON in cache
function createSpriteAnimations(self, json) {
    for (var i=0; i < sprites.length; i++) {
        var files = json.get(sprites[0])[sprites[i]]["files"];
        var keys = [];
        for (var k=0; k < files.length; k++) {
            keys.push(files[k]["key"])
        }
        anim.   getFramesFromArray(self, keys.sort());
    }
};

function moveOtherPlayer(player) {
    var events = queuedMovementEvents[player.playerId];
    for (var i=0; i < events.length; i++) {
        player.setPosition(events[i].x, events[i].y);
    };
    queuedMovementEvents[player.playerId] = [];
}