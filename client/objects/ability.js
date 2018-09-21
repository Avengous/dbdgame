import * as Animation from '../animation.js';

class Ability {

	constructor(game) {
		this.game = game;
		this.player = game.players[game.socket.id];
		this.x = this.player.x;
		this.object = new Phaser.GameObjects.GameObject(game.scene, 'AbilityObject');
        this.object.on('abilityHitEvent', function(abilityObject) {
            console.log(abilityObject)
        });
	}

	basicAttack() {
		var offsetX = this.player.flipX ? (40) : -1*(40);
		var m = new Minion(this.game, this.player.x + offsetX, this.player.y, this.object);
		Animation.playerPunch(this.game, this.game.sprite.spriteHeader);

		this.player.once('animationupdate', function(animation, frame) {
			if (frame.isLast) {
				m.circle();
			};
		}, m);

		this.player.once('animationcomplete', function(object) {
			m.destroy();
		}, m, this.object);

		return this.object;
	}

		/*
		var timedEvent = this.game.time.delayedCall(200, function() {
			m.destroy();
		} , [], this);
		*/
}

class Minion {
    constructor (game, x, y, object) {
        this.game = game.scene;
        this.x = x;
        this.y = y;
        this.object = object;
    }

    circle(r=8) {
        this.body = this.game.matter.add.circle(this.x, this.y, r);
        //this.body.collisionFilter.group = -1;
        this.body.name = 'minionBody'
        this.body.ignoreGravity = true;
        this.body.inertia = 'Infinity';
        this.body.ability = this.object;
    }

    destroy() {
        this.game.matter.world.remove(this.body);
    }
}

export default Ability;