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

Game.init = function(){
    game.stage.disableVisibilityChange = true;
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

    this.load.spritesheet('000', 
        'assets/monster/strawtargetdummy.png',
        { frameWidth: 90, frameHeight: 100 , margin: 4 }
    );

    this.load.tilemapTiledJSON('map', 'assets/json/icyfield.json');
    this.load.image('floor', 'assets/world/icyfield.png');
};

Game.create = function(){
    var self = this;
    this.socket = io();

    map = this.add.tilemap('map');
    //var map = this.make.tilemap({ key: 'map' });

    //  Now add in the tileset. Tiled Tileset name and preloaded associated image.
    tiles = map.addTilesetImage('icyfieldTileset', 'floor');

    //  Create our layers, Tiled LayerName
    groundLayer = map.createStaticLayer('GroundLayer', tiles, 0, 0);
    map.createStaticLayer('Background', tiles,0,0);

    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);
 
    // set the boundaries of our game world
    this.matter.world.setBounds(0, 0, groundLayer.width, groundLayer.height);

    // set collision on groundLayer
    groundLayer.setCollisionByProperty({ collides: true });
    world = this.matter.world.convertTilemapLayer(groundLayer, {'name': 'groundLayer'});

    this.otherPlayers =[];

    // Test Monster
    var config_000 = {
        key: '000_walk',
        frames: this.anims.generateFrameNumbers('000', { start: 0, end: 6, first: 0 }),
        frameRate: 1.5,
        repeat: -1
    };

    this.anims.create(config_000);

    var boom = this.matter.add.sprite(200, 600, '000', 0, {'inertia': 'Infinity', 'name':'trainingDummy'}); // change to matterjs eventually
    //boom.setStatic(true);
    boom.setMass(Infinity);
    console.log(boom);
    boom.anims.play('000_walk');

    // End Test Monster

    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                player = addPlayer(self, players[id]);
                playerStats = setPlayerStats(players[id]);
                playerUi = createPlayerStatUI(self, players[id]);
                // Set camera to follow player
                self.cameras.main.startFollow(player);
                //self.cameras.main.setDeadzone(50, 500);
                //self.cameras.main.setBounds(500,500);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    this.socket.on('disconnect', function (playerId) {
        for (var i=0; i < self.otherPlayers.length; i++) {
            otherPlayer = self.otherPlayers[i];
            if (otherPlayer.playerId === playerId) {
                otherPlayer.destroy();
            };
        };
    });

    this.socket.on('playerMoved', function (playerInfo) {
        for (var i=0; i < self.otherPlayers.length; i++) {
            otherPlayer = self.otherPlayers[i];
            if (otherPlayer.playerId === playerInfo.playerId) {
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            };
        };
    });

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

    this.matter.world.on('collisionstart', function (event) {
        if ((event.pairs[0].bodyB.name == 'playerSprite') && (event.pairs[0].bodyA.name == 'groundLayer' || event.pairs[0].bodyA.name == 'playerSprite')) {
            onGround = true;
        }
    });

    this.socket.on('playerMoved', function (playerInfo) {
        for (var i=0; i < self.otherPlayers.length; i++) {
            otherPlayer = self.otherPlayers[i];
            if (otherPlayer.playerId === playerInfo.playerId) {
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            };
        };
    });

    createSpriteAnimations(self, this.cache.json)
    
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
        // Moves other players on client
        var x = this.player.x;
        var y = this.player.y;

        if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
            this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y });
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
        if (cursors.space.isDown && onGround && !cursors.down.isDown) {
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
        if (cursors.q.isDown) {
            if (cursors.down.isDown) {
                playerProneStab(this, playerCharacter);
            } else {
                playerPunch(this, playerCharacter);
            }
        }
    }
};

// Add Player's Character
function addPlayer(self, playerInfo) {
    playerCharacter = playerInfo.character;
    self.player = self.matter.add.sprite(
        playerInfo.x, playerInfo.y, 
        playerInfo.character + '_stand1_0', 
        0, 
        {'inertia': 'Infinity',
         'name': 'playerSprite'
        }
    );
    return self.player;
};

// Add Other Player's Sprites
function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.matter.add.sprite(
        playerInfo.x, 
        playerInfo.y, 
        playerInfo.character + '_stand1_0', 
        0, 
        {'inertia': 'Infinity', 'name': 'playerSprite'}
    );
    otherPlayer.playerId = playerInfo.playerId;
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

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}