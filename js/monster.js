Game.monster = {};

Game.monster.createAnimations = function(game) {
	var monsterData = game.cache.json.get('monsterData');
	for (monster in monsterData) {
		var data = monsterData[monster];
		for (animation in data.animation) {
			game.anims.create({
				key: 'monsterAnim_' + monster + '_' + animation,
				frames: animation.frames,
				frameRate: animation.frameRate,
				repeat: animation.repeat
			});
		}
	}
}

Game.monster.create = function(game, monster, x, y) {
	
}