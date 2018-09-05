Game.monster = {
	current: [],
};

Game.setMonsterData = function () {
	return Game.main.cache.json.get('monsterData');
}

Game.monster.createAnimations = function(game) {
	for (monster in Game.monsterData) {
		var data = Game.monsterData[monster];
		for (animation in data.animation) {
			game.anims.create({
				key: 'monsterAnim_' + monster + '_' + animation,
				frames: game.anims.generateFrameNumbers('monsterSprite_' + monster, data.animation[animation].frames),
				frameRate: data.animation[animation].frameRate,
				repeat: data.animation[animation].repeat
			});
		}
	}
}

Game.monster.create = function(monsterId, x, y) {
	var monster = Game.main.matter.add.sprite(x, y, 'monsterSprite_' + monsterId, 0, {'inertia': 'Infinity', 'name': Game.monsterData[monsterId].name })	
	monster.body.collisionFilter.group = -1;
	monster.body.name = 'monsterBody';
	monster.anims.play('monsterAnim_' + monsterId + '_walk');
	monster.hp = new HealthBar(Game.main, 0, 0);
	monster.hp.setPosition(monster.x-(monster.width), monster.y-(monster.height));
	Game.monster.current.push(monster);
}