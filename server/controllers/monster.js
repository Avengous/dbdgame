/*

Goal: Basic Attack

Client:
- Sends an attack (only data send is the attack)

Server:
- All damage calculation is checked server side.



Goal: Spawning a Monster

Client:
- Sends a 'spawnMonster(id)' event to server.
- Recieves 'monsterSpawned' event from server
- Passes recieved monster object to a spawnMonster handler which waits for messages from server
- Handler will start various animations, movements or emit other events (such as damageRecieved for example).

Server:
- Recieves spawnMonster(id) event and emits a 'monsterSpawned' event to all players
- monsterSpawned will give a monsterObject with all relevant data
- HP, ATK, CollideDamage, DEF, Level, PhysicsBody, Position
- Once monster has been created, a socket is opened on server to handle the monsters script.
- The script for monster will emit to the client on what the monster should do.


Goal: onKill Event
if Monster (id)
if Player (id)



*/

monsterDb = {
	'000' = {
		name: 'Training Dummy',
		level: 1,
		hp: 10000,
		atk: 0,
		def: 0,
		collideDamage: false,
		bodyId: '000',
		hpRegen: 1
	}
}



var monsterManager = {

};

exports.monsterManager = monsterManager;