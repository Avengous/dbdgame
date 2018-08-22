var playerManager = {
	stats: {},
	info: {}
};

playerManager.info.new = function () {
	return {
		name: 'NewPlayer'
	};
};

playerManager.stats.new = function() {
	return {
		level: 1,
		xp: 0,
		hp: 5,
		mp: 5,
		end: 45,
		ac: 0,
		av: 0,
		res: 0,
		str: 5,
		dex: 5,
		agi: 5,
		sta: 5,
		int: 5,
	};
};

exports.playerManager = playerManager;