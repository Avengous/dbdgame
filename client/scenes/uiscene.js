import { WIDTH, HEIGHT } from '../constants/config.js';
import { FontStyle } from  '../constants/styles.js';

var UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function UIScene ()
    {
        Phaser.Scene.call(this, { key: 'UIScene', active: false });
    },

    create: function () {
        this.add.text(10, 10, 'DBDGAMEDEV', { font: '36px Arial', fill: '#000000' });

        // Eventually only want this available if Admin;
        this.add.existing(this.addDummyButton());;
    },

    addDummyButton: function () {
        var container = new Phaser.GameObjects.Container(this, WIDTH-55, 55);
        var rect = new Phaser.Geom.Rectangle(0, 0, 50, 50);
        var graphics = new Phaser.GameObjects.Graphics(this)
            .fillStyle(0x000000)
            .fillRectShape(rect)
            .lineStyle(2, 0xFFFFFF)
            .strokeRect(rect.x, rect.y, rect.width, rect.height);

        var text = new Phaser.GameObjects.Text(this, 0, 0, "Spawn", FontStyle)
            .setAlign('center');
        text.setPadding((rect.width-text.width)/2, (rect.height-text.height)/2, 0, 0);

        container.add([graphics, text]);
        container.setInteractive(rect, Phaser.Geom.Rectangle.Contains);

        container.on('pointerover', () => {
            text.setColor('#44FF44');
            graphics.clear()
                .fillStyle(0x000000)
                .fillRectShape(rect)
                .lineStyle(2, 0x44FF44)
                .strokeRect(rect.x, rect.y, rect.width, rect.height);
        });

        container.on('pointerout', () => {
            text.setColor('#FFFFFF');
            graphics.clear()
                .fillStyle(0x000000)
                .fillRectShape(rect)
                .lineStyle(2, 0xFFFFFF)
                .strokeRect(rect.x, rect.y, rect.width, rect.height);
        });

        return container;
    }

});

export default UIScene;