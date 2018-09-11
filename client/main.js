//import Phaser, { Game } from 'phaser';
import { WIDTH, HEIGHT, DEFAULT_GRAVITY } from './constants/config.js';
import { Game } from './game.js';
import UIScene from './scenes/uiscene.js';

var config = {
    type: Phaser.AUTO,
    parent: document.getElementById('game'),
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#00ffff',
    pixelArt: true,
    physics: {
    	default: 'matter',
        matter: {
            debug: false,
            gravity: { y: DEFAULT_GRAVITY }
        }
	},
    scene: [{
        init: Game.init,
        preload: Game.preload,
        create: Game.create,
        update: Game.update,
        pack: {
            files: [
                { type: 'json', key: 'monsterDataJson', url: 'assets/json/monsters.json' }
            ]
        }
    }, UIScene]
};

const game = new Phaser.Game(config);