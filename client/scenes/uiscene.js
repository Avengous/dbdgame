import { WIDTH } from '../constants/config.js';
//import { Menu } from '../graphics.js';

var UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function UIScene ()
    {
        Phaser.Scene.call(this, { key: 'UIScene', active: false });
    },

    create: function ()
    {
        //  Our Text object to display the Score
        var info = this.add.text(10, 10, 'DBDGAMEDEV', { font: '36px Arial', fill: '#000000' });

        //var menu = new Menu(this, WIDTH-30, 30);

        //  Grab a reference to the Game Scene
        //var scene = this.scene.get('UIScene'); // Commenting this out until player object is created.

        //  Listen for events from it
        /*ourGame.events.on('addScore', function () {

            this.score += 10;

            info.setText('Score: ' + this.score);

        }, this);*/
    }

});

export default UIScene;