import { NEWCHAR } from '../constants/scenes.js';
import { WIDTH, HEIGHT } from '../constants/config.js';
import { UISCENE, ICYFIELD } from '../constants/scenes.js';
import { CHARACTERS } from '../constants/sprites.js';
import { FontStyle,  } from  '../constants/styles.js';
import { STAND1, WALK1 } from '../constants/animation.js'

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
        var i = 15;
        for (var label in CHARACTERS) {
            var sprite = CHARACTERS[label].spriteHeader;
            this.createCharacterButton(label, sprite, i);
            i += WIDTH/(Object.keys(CHARACTERS).length);
        }
    },

    createCharacterButton: function(label, sprite, position) {
        var container = new Phaser.GameObjects.Container(this, position, HEIGHT/2);

        var rect = new Phaser.Geom.Rectangle(0, 0, 100, 150);
        var graphics = new Phaser.GameObjects.Graphics(this)
            .fillStyle(0x000000)
            .fillRectShape(rect)
            .lineStyle(3, 0xFFFFFF)
            .strokeRect(rect.x, rect.y, rect.width, rect.height);

        var text = new Phaser.GameObjects.Text(this, 0, 0, label, FontStyle)
            .setAlign('center');
        text.setPadding((rect.width-text.width)/2, 0, 0, 0);

        var spriteObj = new Phaser.GameObjects.Sprite(this, 0, 0, sprite + '_stand1_0');

        spriteObj.setPosition(position+(rect.width/2), HEIGHT/2+(rect.height/2));
        spriteObj.anims.play(sprite + '_' + STAND1, true);

        container.add([graphics, text]);
        container.setInteractive(rect, Phaser.Geom.Rectangle.Contains);

        container.on('pointerup', () => this.onCharSelect(label));
        container.on('pointerover', () => this.onHover(sprite, spriteObj, WALK1, graphics, 0x44FF44, rect));
        container.on('pointerout', () => this.onHover(sprite, spriteObj, STAND1, graphics, 0xFFFFFF, rect, 3));

        this.add.existing(container);
        this.add.existing(spriteObj);
    },

    onCharSelect: function(selection) {
        //let player = this.player.players[this.player.socket.id];
        //this.scene.start(UISCENE);
        //this.scene.start(ICYFIELD);
        //this.scene.shutdown();
    },

    onHover: function(label, sprite, anim, object, color, shape, size=3){
        sprite.anims.play(label + '_' + anim, true);
        object.lineStyle(size, color)
        object.strokeRect(shape.x, shape.y, shape.width, shape.height);
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