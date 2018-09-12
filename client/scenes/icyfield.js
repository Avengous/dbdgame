//import io from 'socket.io-client';
import BaseScene from './basescene.js';
//import { DOWN } from '../../shared/constants/directions';
//import { HOUSE_1, HOUSE_2, TOWN } from '../../shared/constants/scenes';
import { MAP_ICYFIELD, IMAGE_ICYFIELD } from '../constants/maps.js';
import { ICYFIELD } from '../constants/scenes.js';

// Creating from extending Town

class Icyfield extends BaseScene {
    constructor() {
        super(ICYFIELD);
    }

    init(data) {
        super.init(this.getPosition(data)); 
    }

    create() {
        super.create(MAP_ICYFIELD, IMAGE_ICYFIELD, false);
    }

    registerCollision() {
        let player = this.player.players[this.player.socket.id];

        /*
        this.physics.add.collider(player, this.layers[6]);
        this.physics.add.collider(player, this.layers[8]);
        this.physics.add.collider(player, this.layers[9]);
        this.physics.add.collider(player, this.layers[7], (sprite, tile) => {
            if (tile.index === 167) {
                this.nextSceneKey = HOUSE_1;
                this.onChangeScene();
            }
            else if (tile.index === 1661 || tile.index === 1662) {
                this.nextSceneKey = HOUSE_2;
                this.onChangeScene();
            }
        });
        */
    }

    getPosition(data) {
        return { x: 400, y: 300 };
    }
}

export default Icyfield;
