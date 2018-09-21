import BaseScene from './basescene.js';
import { MAP_ICYFIELD, IMAGE_ICYFIELD } from '../constants/maps.js';
import { ICYFIELD } from '../constants/scenes.js';

class Icyfield extends BaseScene {
    constructor() {
        super(ICYFIELD);
    }

    init(data) {
        super.init(this.getPosition(), data); 
    }

    create() {
        super.create(MAP_ICYFIELD, IMAGE_ICYFIELD, false);
    }

    registerCollision() {
        let player = this.player.players[this.player.socket.id];

        // Let everything collide with ground layer.
        this.layers[0].setCollisionByExclusion([-1]);
        this.layers[0].setCollisionByProperty({ collides: true });
        this.matter.world.setBounds(0, 0, this.layers[0].width, this.layers[0].height);

        // Name key lets us easily find a specific layer to detect collisions against
        this.matter.world.convertTilemapLayer(this.layers[0], {'name': 'groundLayer'});
    }

    getPosition() {
        return { x: 400, y: 300 };
    }
}

export default Icyfield;
