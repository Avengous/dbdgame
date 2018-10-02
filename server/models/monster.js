import { BaseMonsterModel } from './basemodel';
import { NEW_MONSTER, ALL_MONSTERS, MOVE, STOP, REMOVE } from '../../client/constants/monsters';
import { ICYFIELD } from '../../client/constants/scenes';

class Monster extends BaseMonsterModel {

    /* 
        - Monster updates are sent from server to client. (creating, moving, attacking, etc)
        - Monster create events will broadcast to all players to create monster client side.
        - Monster data is stored server side so when a player moves into a new zone, it can create the monsters pre-existing in that zone.
    */

    static onConnect(io, socket) {
        let monster;
        
        socket.on(NEW_MONSTER, (room, position, id, data) => {
            socket.join(room);
            socket.room = room;

            monster = new Monster(socket.id, position, id, data);
            Monster.list[room][socket.id] = monster;

            let monsters = [];

            for (let i in Monster.list[room]) {
                monsters.push(Monster.list[room][i]);
            }

            socket.emit(ALL_MONSTERS, monsters);

            socket.broadcast.to(room).emit(NEW_MONSTER, monster);
        });
        /*
        socket.on(MOVE, (direction, coor) => {
            player.update(direction, coor);
            socket.broadcast.to(socket.room).emit(MOVE, player);
        });

        socket.on(STOP, (coor) => {
            monster.updatePosition(coor);
            socket.broadcast.to(socket.room).emit(STOP, monster);
        });
        */

    }

    static onDisconnect(io, socket) {
        if (Monster.list[socket.room])
            delete Monster.list[socket.room][socket.id];

        io.to(socket.room).emit(REMOVE, socket.id);
    }

    constructor(id, position, monsterId, data) {
        super(id, position.x, position.y, monsterId, data);

        // Direction is not used since game is not top-down.
        this.direction = position.direction;

        this.animationFlipX = false;
    }

    updatePosition(coor) {
        this.x = coor.x;
        this.y = coor.y;
    }

    update(direction, coor) {
        this.updatePosition(coor);
        this.direction = direction;
    }
}

Monster.list = {};
Monster.list[ICYFIELD] = {};

export default Monster;
