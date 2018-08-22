var Game = {};
var player;
var cursors;
var standing;
var sprites ;
var playerCharacter;

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

    this.load.tilemapTiledJSON('map', 'assets/json/icyfield.json');
    this.load.image('floor', 'assets/world/icyfield.png');
};

Game.create = function(){
    var self = this;
    this.socket = io();


    // ---------------
    map = this.add.tilemap('map');
    //var map = this.make.tilemap({ key: 'map' });

    //  Now add in the tileset. Tiled Tileset name and preloaded associated image.
    tiles = map.addTilesetImage('icyfieldTileset', 'floor');

    //  Create our layers, Tiled LayerName
    groundLayer = map.createStaticLayer('GroundLayer', tiles);
    map.createStaticLayer('Background', tiles);

    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);
 
    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;
    // ----------------

    this.otherPlayers = this.physics.add.group({
        collideWorldBounds: true
    });

    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                player = addPlayer(self, players[id]);
                // Set camera to follow player
                self.cameras.main.startFollow(player);
                // Collide with ground layer
                self.physics.add.collider(groundLayer, self.player);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });

    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });

    this.socket.on('playerAnimationChangeEvent', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {

                if (playerInfo.animationFlipX != null) {
                    otherPlayer.flipX = playerInfo.animationFlipX;
                }
                otherPlayer.anims.play(playerInfo.animationKey, true);
            }
        });
    });

    createSpriteAnimations(self, this.cache.json)
    
    // keyboard movement
    cursors = this.input.keyboard.createCursorKeys();

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // set background color, so the sky is not black    
    //this.cameras.main.setBackgroundColor('#ccccff'); 
};

Game.update = function(time, delta) {
    if (this.player) {

        // emit player movement
        var x = this.player.x;
        var y = this.player.y;
        //var standing;

        if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
            this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y });
        }
         
        // save old position data
        this.player.oldPosition = {
            x: this.player.x,
            y: this.player.y,
        };

        if (cursors.left.isDown)
        {
            standing = false;
            this.player.body.setVelocityX(-200);
            this.player.anims.play(playerCharacter + '_walk1', true);
            this.player.flipX = false;
            this.socket.emit('animationEvent', { key: playerCharacter + '_walk1', flipX: false });
        }
        else if (cursors.right.isDown)
        {
            standing = false;
            this.player.body.setVelocityX(200);
            this.player.anims.play(playerCharacter + '_walk1', true);
            this.player.flipX = true;
            this.socket.emit('animationEvent', { key: playerCharacter + '_walk1', flipX: true });
        } else {
            this.player.body.setVelocityX(0);
            this.player.anims.play(playerCharacter + '_stand1', true);
            if (!standing) {
                this.socket.emit('animationEvent', { key: playerCharacter + '_stand1', flipX: null });
                standing = true;
            }
        }

        if (cursors.space.isDown && this.player.body.onFloor())
        {
            standing = false;
            this.player.body.setVelocityY(-600);
        }

        if (cursors.down.isDown && this.player.body.onFloor())
        {   
            standing = false;
            this.player.body.stop()
            this.player.anims.play(playerCharacter + '_prone', true);
            this.socket.emit('animationEvent', { key: playerCharacter + '_prone', flipX: null });
        }

        if (!this.player.body.onFloor())
        {
            standing = false;
            this.player.anims.play(playerCharacter + '_jump', true);
            this.socket.emit('animationEvent', { key: playerCharacter + '_jump', flipX: null });
        }
    }
};

// Phaser 3 Add Player
function addPlayer(self, playerInfo) {
    playerCharacter = playerInfo.character;
    self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.character + '_stand1_0');
    self.player.setCollideWorldBounds(true);
    return self.player;
};

// Phaser 3 Add Other Players
function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.character + '_stand1_0');
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
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