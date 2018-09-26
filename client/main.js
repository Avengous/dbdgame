import Phaser, { Game } from 'phaser';
import { WIDTH, HEIGHT, DEFAULT_GRAVITY } from './constants/config.js';
import Init from './scenes/init.js';
import UIScene from './scenes/uiscene.js';
import Icyfield from './scenes/icyfield.js';
import NewCharScene from './scenes/newchar.js';

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
    scene: [
        Init, NewCharScene, Icyfield, UIScene
    ]
};

const game = new Game(config);

/*scene: [{-
    init: Game.init,
    preload: Game.preload,
    create: Game.create,
    update: Game.update,
    pack: {
        files: [
            { type: 'json', key: 'monsterDataJson', url: 'assets/json/monsters.json' }
        ]
    }
}, UIScene]*/