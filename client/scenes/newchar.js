import { NEWCHAR } from '../constants/scenes.js';
import { WIDTH, HEIGHT } from '../constants/config.js';
import { UISCENE, ICYFIELD } from '../constants/scenes.js';
import { CHARACTERS } from '../constants/sprites.js';
import { FontStyle,  } from  '../constants/styles.js';
import { playerStand, playerAlert } from '../animation.js';

var NewCharScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function NewCharScene () {
        Phaser.Scene.call(this, { key: NEWCHAR, active: false });
    },

    preload: function () {
        //this.load.on('complete', this.onLoadComplete, this);
    },

    create: function () {
        let info = this.add.text(WIDTH/2, 20, 'Character Creation', { font: '36px Arial', fill: '#000000' });
        info.setOrigin(0.5);
        console.log('This', this);
        var i = 15;
        for (var label in CHARACTERS) {
            var sprite = CHARACTERS[label].spriteHeader;
            this.createCharacterButton(label, sprite, i);
            i += WIDTH/(Object.keys(CHARACTERS).length);
        }
    },

    createCharacterButton: function(label, sprite, position) {
        var container = new Phaser.GameObjects.Container(this, position, HEIGHT/2)
            .setSize(100, 150)
            .setInteractive();

        var rect = new Phaser.Geom.Rectangle(0, 0, 100, 150);
        var graphics = new Phaser.GameObjects.Graphics(this)
            .fillStyle(0x000000)
            .fillRectShape(rect)
            .setInteractive();

        var text = new Phaser.GameObjects.Text(this, 0, 0, label, FontStyle)
            .setAlign('center');
        text.setPadding((container.width-text.width)/2, 0, 0, 0);

        var sprite = new Phaser.GameObjects.Sprite(this, 0, 0, sprite + '_stand1_0');

        sprite.setPosition(container.width/2, container.height/2)

        container.on('pointerup', this.onCharSelect, label);
        graphics.on('pointerover', function(){
            this.fillStyle(0xFF0000);
        });

        container.add([graphics, text, sprite]);
        this.add.existing(container);



    },

    onLoadComplete: function (loader) {
        this.scene.start(UISCENE);
        this.scene.start(ICYFIELD);
        this.scene.shutdown();
    },

    onCharSelect: function (ponter, x, selection) {
        console.log('onCharSelect', selection);
    }

});

export default NewCharScene;
/*
let Rectangle = Phaser.Geom.Rectangle;
let main = Rectangle.Clone(this.cameras.main);

this.progressRect = new Rectangle(0, 0, main.width / 2, 50);
Rectangle.CenterOn(this.progressRect, main.centerX, main.centerY);

this.progressCompleteRect = Phaser.Geom.Rectangle.Clone(this.progressRect);

this.progressBar = this.add.graphics();


    self.player = self.matter.add.sprite(
        400,
        300, 
        playerInfo.character + '_stand1_0', 
        0, 
        {'inertia': 'Infinity',
         'name': 'playerSprite'
        }
    );
*/