import io from 'socket.io-client';
import BaseScene from '../utilities/base-scene';
import { DOWN } from '../../shared/constants/directions';
import { HOUSE_1, HOUSE_2, TOWN } from '../../shared/constants/scenes';
import { MAP_TOWN, IMAGE_TOWN } from '../constants/assets'; // Tilemap and Image

// Creating from extending Town

class Icyfield extends BaseScene {
    constructor() {
        super(ICYFIELD);
    }

    init(data) {
        super.init(this.getPosition(data));
    }

    create() {
        super.create(MAP_TOWN, IMAGE_TOWN, false);
    }

    registerCollision() {
        let player = this.player.players[this.player.socket.id];

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
    }

    getPosition(data) {
        if (data === HOUSE_1 || Object.getOwnPropertyNames(data).length === 0) {
            return { x: 225, y: 280, direction: DOWN };
        }
        else if (data === HOUSE_2) {
            return { x: 655, y: 470, direction: DOWN };
        }
    }
}

export default Town;
