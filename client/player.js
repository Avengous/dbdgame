// Deprecated

import { playerCharacter } from './game.js';
import { Minion } from './graphics.js';
import * as Anim from './animation.js';

function createPlayerStatUI(self, player) {
	stats = player.stats;
	info = player.info;
	ui = {
		name: self.add.text(5, 5, info.name, { fontFamily:'Comic Sans MS', fontSize: 16, color: '#000000' }).setScrollFactor(0).setShadow(1,1),
		hp: self.add.text(5, 5+17, 'HP: ' + stats.hp, { fontFamily:'Comic Sans MS', fontSize: 16, color: '#ff0000' }).setScrollFactor(0).setShadow(1,1),
		mp: self.add.text(5, 5+(17*2), 'MP: ' + stats.mp, { fontFamily:'Comic Sans MS', fontSize: 16, color: '#0000ff' }).setScrollFactor(0).setShadow(1,1),
		end: self.add.text(5, 5+(17*3), 'END: ' + stats.end, { fontFamily:'Comic Sans MS', fontSize: 16, color: '#ffff00' }).setScrollFactor(0).setShadow(1,1)
	};
	return ui;
};

export function setPlayerStats(player) {
	var stats = player.stats;
	stats.hp = stats.hp + (stats.sta * (5 + Math.floor(stats.sta/10)))
	stats.end = stats.end + (stats.sta * (1 + Math.floor(stats.sta/20)))
	stats.mp = stats.mp + (stats.int * (0 + Math.floor(stats.int/5)))
	return stats;
};

export class Ability {

	constructor(game) {
		this.game = game;
		this.player = game.player;
		this.x = this.player.x;
		this.object = new Phaser.GameObjects.GameObject(game, 'AbilityObject');
        this.object.on('abilityHitEvent', function(abilityObject) {
            console.log(abilityObject)
        });
	}

	basicAttack() {
		var offsetX = this.player.flipX ? (40) : -1*(40);
		var m = new Minion(this.game, this.player.x + offsetX, this.player.y, this.object);
		Anim.playerPunch(this.game, playerCharacter);

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