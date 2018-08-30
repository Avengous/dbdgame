class HUD extends Phaser.Scene {

    constructor () {
        super({ key: 'HUD', active: true });

    }

    create () {
        
        let hud = this.scene.get('HUD');

        /* Sample Add Events
        let info = this.add.text(10, 10, 'Score: 0', { font: '48px Arial', fill: '#000000' });
        hud.events.on('addScore', function () {

            this.score += 10;

            info.setText('Score: ' + this.score);

        }, this);
        */
    }
}

class Button {
    constructor (scene) {

    }
}

class HealthBar {

    constructor (scene, x, y) {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = x;
        this.y = y;
        this.value = 100;
        this.p = 76 / 100;

        this.draw();

        scene.add.existing(this.bar);
    }

    decrease (amount) {
        this.value -= amount;

        if (this.value < 0)
        {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }

    draw () {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, 80, 9);

        //  Health

        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, 76, 6);

        if (this.value < 30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else
        {
            this.bar.fillStyle(0x00ff00);
        }

        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x + 2, this.y + 2, d, 6);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.draw();
    }

}

class Minion {
    constructor (game, x, y, object) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.object = object;
    }

    circle(r=8) {
        this.body = this.game.matter.add.circle(this.x, this.y, r);
        //this.body.collisionFilter.group = -1;
        this.body.name = 'minionBody'
        this.body.ignoreGravity = true;
        this.body.inertia = 'Infinity';
        this.body.ability = this.object;
    }

    destroy() {
        this.game.matter.world.remove(this.body);
    }
}