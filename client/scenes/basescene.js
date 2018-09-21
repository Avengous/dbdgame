//import { Scene } from 'phaser';
import Player from '../objects/player.js';
//import { FADE_DURATION } from '../constants/config.js';
//import { STOP } from '../../shared/constants/actions/player';
//import TilesetAnimation from './tileset-animation';

const { SPACE, LEFT, RIGHT, UP, DOWN, Q, W, E, R } = Phaser.Input.Keyboard.KeyCodes;

class BaseScene extends Phaser.Scene {

    constructor(key) {
        super({ key });
        this.key = key;
    }

    init(position, data) {
        this.scene.setVisible(false, this.key);
        this.player = new Player(this, this.key, position, data);
        this.layers = {};
        this.prevSceneKey = this.key;
        this.nextSceneKey = null;
        this.transition = true;
        this.input.keyboard.removeAllListeners();
    }

    create(tilemap, tileset, withTSAnimation) {

        // Player Controls
        this.cursors = this.input.keyboard.addKeys({
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

        this.withTSAnimation = withTSAnimation;
        this.map = this.add.tilemap(tilemap);

        // Now add in the tileset. Tiled Tileset name and preloaded associated image.
        // Added this.map.tilesets[0].name.
        this.tileset = this.map.addTilesetImage(this.map.tilesets[0].name, tileset);

        for (let i = 0; i < this.map.layers.length; i++) {
            if (withTSAnimation)
                this.layers[i] = this.map.createDynamicLayer(this.map.layers[i].name, this.tileset, 0, 0);
            else
                this.layers[i] = this.map.createStaticLayer(this.map.layers[i].name, this.tileset, 0, 0);
            this.layers[i].name = this.map.layers[i].name;
        }

        // Must setup collision before creating player.
        this.registerCollision();

        this.player.create(this.data);

        this.cameras.main.on('camerafadeincomplete', () => {
            this.transition = false;

            this.input.keyboard.on('keyup', (event) => {
                if (event.keyCode >= 37 && event.keyCode <= 40) {
                    this.player.stop();
                }
            });
            
            // Not Implemented
            //this.registerController();
        });

        this.cameras.main.on('camerafadeoutcomplete', this.changeScene.bind(this));
    }

    update() {
        if (this.transition === false) {

            if (this.cursors.left.isDown) {
                this.player.left();
            } else if (this.cursors.right.isDown) {
                this.player.right();
            } else {
                this.player.stop();
            }

            if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && !this.cursors.down.isDown) {
                this.player.jump();
            }
        }
    }

    onChangeScene() {
        this.transition = true;
        this.player.stop();
        this.cameras.main.fade(FADE_DURATION);
    }

    changeScene() {
        if (this.withTSAnimation)
            this.tilesetAnimation.destroy();

        this.player.socket.disconnect();
        this.scene.start(this.nextSceneKey, this.prevSceneKey);
    }

    registerCollision() {
        throw new Error('registerCollision() not implemented');
    }

    registerTilesetAnimation(layer) {
        this.tilesetAnimation = new TilesetAnimation();
        this.tilesetAnimation.register(layer, this.tileset.tileData);
        this.tilesetAnimation.start();
    }

    registerController() {
        /* Not Implemented
        this.hold(document.getElementById('up'), this.player.up.bind(this.player));
        this.hold(document.getElementById('down'), this.player.down.bind(this.player));
        this.hold(document.getElementById('left'), this.player.left.bind(this.player));
        this.hold(document.getElementById('right'), this.player.right.bind(this.player));
        */
    }

    hold(btn, action) {
        let t;
        let repeat = () => { action(); t = setTimeout(repeat, this.timeout); }
        btn.onmousedown = (e) => { e.preventDefault(); if (this.transition === false) repeat(); }
        btn.onmouseup = (e) => { e.preventDefault(); clearTimeout(t); if (this.transition === false) this.player.stop(); }
        btn.ontouchstart = (e) => { e.preventDefault(); if (this.transition === false) repeat(); }
        btn.ontouchend = (e) => { e.preventDefault(); clearTimeout(t); if (this.transition === false) this.player.stop(); }
    }
}

export default BaseScene;
