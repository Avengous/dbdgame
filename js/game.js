var Game = {};
var player;
var cursors;
var sprites ;
var playerCharacter;
var standing;
var onGround;
var playerStats;
var playerui;
const { SPACE, LEFT, RIGHT, UP, DOWN, Q, W, E, R } = Phaser.Input.Keyboard.KeyCodes;

var buffered_movementData = {
    'lastSent': new Date().getTime(), 
    'movementData': []
};

var queuedMovementEvents = {};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    this.load.json("monsterData", 'assets/json/monsters.json');

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

    var bgm = this.sound.add('bgm');
    bgm.pauseOnBlur = false;
    bgm.play();

    bgm.on('ended', function() {
        bgm.play();
    });

    map = this.add.tilemap('map');
    //var map = this.make.tilemap({ key: 'map' });

    //  Now add in the tileset. Tiled Tileset name and preloaded associated image.
    tiles = map.addTilesetImage('icyfieldTileset', 'floor');

    //  Create our layers, Tiled LayerName
    groundLayer = map.createStaticLayer('GroundLayer', tiles, 0, 0);
    map.createStaticLayer('Background', tiles,0,0);

    // Everything will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);
    
    // set the boundaries of our game world
    this.matter.world.setBounds(0, 0, groundLayer.width, groundLayer.height);

    // set collision on groundLayer
    groundLayer.setCollisionByProperty({ collides: true });

    world = this.matter.world.convertTilemapLayer(groundLayer, {'name': 'groundLayer'});

    this.otherPlayers =[];
    this.monsters = [];

    // Test Monster
    // Move frame generation to animation

    var config_0 = {
        key: '0_walk',
        frames: this.anims.generateFrameNumbers('monsterSprite_0', { start: 0, end: 6, first: 0 }),
        frameRate: 1.5,
        repeat: -1
    };
    console.log('c0', config_0);
    //console.log('M', new Monster())

    this.anims.create(config_0);

    // Move body creation to monsters.js
    var boom = this.matter.add.sprite(200, 600, 'monsterSprite_0', 0, {'inertia': 'Infinity', 'name':'trainingDummy'});
    boom.body.collisionFilter.group = -1;
    boom.body.name = 'monsterBody';
    boom.anims.play('0_walk');

    // Ping server to get monster health for bar.
    boom.hp = new HealthBar(self, 0, 0);
    boom.hp.setPosition(boom.x-(boom.width), boom.y-(boom.height));
    this.monsters.push(boom);

    // End Test Monster

    // Adds current player and other previously connected players to game on connect
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                player = addPlayer(self, players[id]);
                playerStats = setPlayerStats(players[id]);
                playerUi = createPlayerStatUI(self, players[id]);
                self.cameras.main.startFollow(player);
                console.log(player);
                //self.cameras.main.setDeadzone(50, 500);
                //self.cameras.main.setBounds(500,500);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    // Add new players to game
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
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
    createMonsterAnimations(this);
    
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
            playerWalkLeft(this, playerCharacter);
        } else if (cursors.right.isDown) {
            standing = false;
            this.player.setVelocityX(5);
            playerWalkRight(this, playerCharacter);
        } else {
            this.player.setVelocityX(0);
            if (!standing) {
                playerStand(this, playerCharacter);
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
            playerJump(this, playerCharacter);
        }
        
        // Player Prone Movement
        if (cursors.down.isDown) {   
            standing = false;
            if (onGround) this.player.setVelocityX(0);
            playerProne(this, playerCharacter);
        }

        // Basic Attack
        if (cursors.q.isDown && !ANIMATION_LOCK) {
            if (cursors.down.isDown) {
                playerProneStab(this, playerCharacter);
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
        files = json.get(sprites[0])[sprites[i]]["files"]
        keys = []
        for (var k=0; k < files.length; k++) {
            keys.push(files[k]["key"])
        }
        getFramesFromArray(self, keys.sort());
    }
};

function moveOtherPlayer(player) {
    var events = queuedMovementEvents[player.playerId];
    for (var i=0; i < events.length; i++) {
        player.setPosition(events[i].x, events[i].y);
    };
    queuedMovementEvents[player.playerId] = [];
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}