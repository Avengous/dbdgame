var config = {
    type: Phaser.AUTO,
    parent: document.getElementById('game'),
    width: 800,
    height: 600,
    backgroundColor: '#00ffff',
    pixelArt: true,
    physics: {
    	default: 'matter',
	    arcade: {
	        gravity: {y: 2000},
	        debug: false
	    },
        matter: {
            debug: false,
            gravity: { y: 1.5 }
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

var game = new Phaser.Game(config);