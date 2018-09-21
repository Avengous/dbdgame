// Deprecated

import { WIDTH, HEIGHT } from './constants/config.js';
import { player } from './game.js';

export class Menu {

    constructor(scene, x, y) {
        this.scene = scene;
        this.menuButton = new Button(this.scene, x, y).addLabel('Menu');
        this.menuButton.container.on('pointerup', () => this.displayMenu());
        this.menuButton.draw();

        this.container = new Phaser.GameObjects.Container(this.scene, WIDTH/2, HEIGHT/2)
        this.container.active = false;

        var style = { 
            fontFamily:'Comic Sans MS',
            fontSize: '14px',
            fill: '#FFFFFF',
            fontWeight: 'bold',
            stroke: '#2e6da4'
        };

        var styleHighlight = { 
            fontFamily:'Comic Sans MS',
            fontSize: '14px',
            fill: '#2e6da4',
            fontWeight: 'bold',
            stroke: '#2e6da4'
        };

        var windowBG = new Phaser.GameObjects.Graphics(this.scene)
            .fillStyle(0x343a40)
            .lineStyle(2, 0x000000)
            .fillRect(-50, -100, 100, 200)
            .strokeRect(-50, -100, 100, 200);

        var windowLabel = new Phaser.GameObjects.Text(this.scene, 0, -90, 'Menu', style)
            .setOrigin(0.5);

        var spawnDummyButton = new Phaser.GameObjects.Text(this.scene, 0, -70, 'Spawn Dummy', style)
            .setOrigin(0.5)
            .setName('spawnDummyButton')
            .setInteractive();

        spawnDummyButton.on('pointerover', function() {
            this.setStyle(styleHighlight)
        });

        spawnDummyButton.on('pointerout', function() {
            this.setStyle(style);
        });

        spawnDummyButton.on('pointerup', function() {
            Client.createMonster(0, player.x, player.y);
        }, player);

        this.objects = [windowBG, windowLabel, spawnDummyButton];
    }

    displayMenu() {
        if (this.container.active) {
            this.hideMenu();
        } else {
            this.container.active = true;
            this.container.add(this.objects);
            this.scene.add.existing(this.container);
        }
    }

    hideMenu() {
        this.container.active = false;
        this.container.removeAll();
    }
}

class Button {

    constructor(scene, x, y, w=50, h=50, c=10) {
        // X and Y is where the button should be

        this.scene = scene;
        this.width = w;
        this.height = h;
        this.corners = c;
        this.x = x;
        this.y = y;
        this.container = new Phaser.GameObjects.Container(this.scene, this.x, this.y);
        this.container.setSize(this.width, this.height);
        this.container.setInteractive();
        this.objects = [];
    }

    addLabel(text='', style=null) {
        if (!style) {
            style = { 
                fontFamily:'Comic Sans MS',
                fontSize: '18px',
                fill: '#FFFFFF',
                fontWeight: 'bold',
                stroke: '#2e6da4'
            };
        }

        text = new Phaser.GameObjects.Text(this.scene, (-1*(this.width/2))+2, -1*(this.height/5), text, style);
        text.name = 'Label';
        this.objects.push(text);
        return this;
    }

    addBackground(bg=null) {
        if (!bg) {
            bg = new Phaser.GameObjects.Graphics(this.scene)
                .fillStyle(0x337ab7)
                .lineStyle(2, 0x2e6da4)
                .fillRoundedRect(-1*(this.width/2), -1*(this.height/2), this.width, this.height, this.corners)
                .strokeRoundedRect(-1*(this.width/2), -1*(this.height/2), this.width, this.height, this.corners);
        }
        bg.name = 'Background';
        this.objects.unshift(bg);
        return this;
    }

    onHover() {
        var bg = this.container.getByName('Background');
        bg.lineStyle(2, 0xFFFFFF);
        bg.strokeRoundedRect(-1*(this.width/2), -1*(this.height/2), this.width, this.height, this.corners);
    }

    onOut() {
        var bg = this.container.getByName('Background');
        bg.lineStyle(2, 0x2e6da4);
        bg.strokeRoundedRect(-1*(this.width/2), -1*(this.height/2), this.width, this.height, this.corners);
    }

    draw() {
        this.addBackground();
        this.container.add(this.objects);
        this.container
            .on('pointerover', () => this.onHover())
            .on('pointerout', () => this.onOut());
        this.scene.add.existing(this.container);
        return this;
    }
}

export class HealthBar {

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
        if (this.value < 0) {
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

        if (this.value < 30) {
            this.bar.fillStyle(0xff0000);
        } else {
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

export class Minion {
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