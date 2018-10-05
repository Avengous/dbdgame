import BaseScene from './basescene.js';
import { MAP_ICYFIELD, IMAGE_ICYFIELD } from '../constants/maps.js';
import { ICYFIELD } from '../constants/scenes.js';
import { Monster } from '../objects/monster';
import { TRAINING_DUMMY } from '../constants/monsters';

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

        // This uses the tile property set in Tiled to determine collision.
        //this.layers[0].setCollisionByProperty({ collides: true });

        this.matter.world.setBounds(0, 0, this.layers[0].width, this.layers[0].height);

        // Name key lets us easily find a specific layer to detect collisions against. Must set collision before this.
        this.matter.world.convertTilemapLayer(this.layers[0], {'name': 'groundLayer'});

        // Workaround. Need to start server listener to let first mob spawn.
        var m = new Monster(
            this.game.currentBaseScene,
            this.game.currentBaseScene.key,
            { x: 200, y: 150 },
            TRAINING_DUMMY);
        m.create();
        m.destroy();
        console.log(this);
    }

    getPosition() {
        return { x: 400, y: 300 };
    }
}

export default Icyfield;
