//import { Scene } from 'phaser';
//import { UP, LEFT, DOWN, RIGHT } from '../../shared/constants/directions';
//import { TOWN } from '../../shared/constants/scenes';
import { INIT, ICYFIELD } from '../constants/scenes.js';
import * as anim from '../animation.js';

const sprites = ["base","johnny","shock","stephen"];

//import { MAP_TOWN, MAP_HOUSE_1, MAP_HOUSE_2, IMAGE_HOUSE, IMAGE_TOWN, IMAGE_PLAYER } from '../constants/assets';

/*
- Load all Tilemaps, Spritesheets
- Generate all animations
*/

class Init extends Phaser.Scene {
    constructor() {
        super({ key: INIT });
        this.progressBar = null;
        this.progressCompleteRect = null;
        this.progressRect = null;
    }

    init() {
        //Game.monsterData = this.cache.json.get('monsterDataJson');
        //Game.main = this;
    }

    preload() {
        for (var i=0; i < sprites.length; i++) {
            this.load.pack(sprites[i], "assets/json/characters.json", sprites[i]);
        }

        // Load Monster Sprites. Json doesn't work in preload so will have to hard code.
        this.load.spritesheet('monsterSprite_0', 'assets/monster/0.png', { frameWidth: 90, frameHeight: 100 , margin: 4 });

        this.load.tilemapTiledJSON('map', 'assets/json/icyfield.json');
        this.load.image('floor', 'assets/world/icyfield.png');

        this.load.audio('bgm', ['assets/sfx/bgm.m4a']);

        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        this.createProgressBar();
    }

    create() {
        /*
            this.music = this.sound.add('music-town', { loop: true });
            this.music.play();
        */

        // Create player animations (from animations.js)
        createSpriteAnimations(this, this.cache.json);
        //Game.monster.createAnimations(this); // Need to fix this
    }

    createProgressBar() {
        let Rectangle = Phaser.Geom.Rectangle;
        let main = Rectangle.Clone(this.cameras.main);

        this.progressRect = new Rectangle(0, 0, main.width / 2, 50);
        Rectangle.CenterOn(this.progressRect, main.centerX, main.centerY);

        this.progressCompleteRect = Phaser.Geom.Rectangle.Clone(this.progressRect);

        this.progressBar = this.add.graphics();
    }

    onLoadComplete(loader) {
        this.scene.start(ICYFIELD);
        this.scene.shutdown();
    }

    onLoadProgress(progress) {
        let color = (0xffffff);

        this.progressRect.width = progress * this.progressCompleteRect.width;
        this.progressBar
            .clear()
            .fillStyle(0x222222)
            .fillRectShape(this.progressCompleteRect)
            .fillStyle(color)
            .fillRectShape(this.progressRect);
    }
}

// Create animations for sprites from JSON in cache
function createSpriteAnimations(self, json) {
    for (var i=0; i < sprites.length; i++) {
        var files = json.get(sprites[0])[sprites[i]]["files"];
        var keys = [];
        for (var k=0; k < files.length; k++) {
            keys.push(files[k]["key"])
        }
        anim.getFramesFromArray(self, keys.sort());
    }
};

export default Init;
