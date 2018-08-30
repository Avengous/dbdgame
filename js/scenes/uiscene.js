var UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function UIScene ()
    {
        Phaser.Scene.call(this, { key: 'UIScene', active: true });

        this.score = 0;
    },

    create: function ()
    {
        //  Our Text object to display the Score
        var info = this.add.text(10, 10, 'ADMIN', { font: '36px Arial', fill: '#000000' });

        //  Grab a reference to the Game Scene
        var ourGame = this.scene.get('GameScene');

        //  Listen for events from it
        /*ourGame.events.on('addScore', function () {

            this.score += 10;

            info.setText('Score: ' + this.score);

        }, this);*/
    }

});