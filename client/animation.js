var KEY_WALK1 = 'walk1';
var KEY_WALK2 = 'walk2';
var KEY_JUMP = 'jump';
var KEY_PRONE = 'prone';
var KEY_PRONE_STAB = 'proneStab';
var KEY_STAND1 = 'stand1';
var KEY_STAND2 = 'stand2';
var KEY_FLY = 'fly';
var KEY_ROPE = 'rope';
var KEY_LADDER = 'ladder';
var KEY_SIT = 'sit';
var KEY_ALERT = 'alert';
var KEY_HEAL = 'heal';
var KEY_SHOOT1 = 'shoot1'; //Bow
var KEY_SHOOT2 = 'shoot2'; // Xbow
var KEY_SHOOTF = 'shootF'; // What is this for? Gun? Crit? FA?
var KEY_STAB1 = 'stabO1'; // One Handed Stab
var KEY_STAB2 = 'stabO2'; // One Handed Punch
var KEY_STABF = 'stabOF'; // One Handed Final Attack (Chidori)
var KEY_SPEAR1 = 'stabT1'; // Two Handed Spear Stab
var KEY_SPEAR2 = 'stabT2'; // Two Handed Spear Stab
var KEY_SPEARF = 'stabTF'; // Two Handed Spear Final Attack
var KEY_SWING1 = 'swingO1'; // One Handed Swing
var KEY_SWING2 = 'swingO2'; // One Handed Swing
var KEY_SWING3 = 'swingO3'; // One Handed Swing
var KEY_SWINGF = 'swingOF'; // One Handed Swing Final Attack
var KEY_POLEARM1 = 'stabP1'; // Two Handed Polearm Swing
var KEY_POLEARM2 = 'stabP2'; // Two Handed Polearm Swing
var KEY_POLEARMF = 'stabPF'; // Two Handed Polearm Final Attack
var KEY_GREATSWORD1 = 'swingT1'; // Two Handed Sword Swing
var KEY_GREATSWORD2 = 'swingT2'; // Two Handed Sword Swing
var KEY_GREATSWORD3 = 'swingT3'; // Two Handed Sword Swing
var KEY_GREATSWORDF = 'swingTF'; // Two Handed Sword Swing Final Attack
var EVENT_ANIM = 'animationEvent';
var ANIMATION_LOCK = false;

function getFramesFromArray(self, keys) {
    data = {};
    for (var i=0; i < keys.length; i++) {
        k = keys[i].split("_");
        key = k[0] + "_" + k[1];
        if (key in data) {
            if (data[key] < k[2]) {
                data[key] = k[2];
            };
        } else {
            data[key] = k[2]
        };
    };
    sortAnimationKeys(self, data);
};

function sortAnimationKeys(self, keys) {
    for (var key in keys) {
        data = {
            "key": key,
            "frames": createFramesArray(key, keys[key]),
            "frameRate": 4,
            "repeat": -1
        };
        k = key.split("_");
        if ([KEY_WALK1, KEY_WALK2].includes(k[1])) {
            data["frameRate"] = 6;
            createAnimation(self, data);
        } else if ([KEY_STAND1, KEY_STAND2].includes(k[1])) {
            data["frameRate"] = 1.5;
            createAnimation(self, data);
        } else if (keys[key] == 0) {
            data["frameRate"] = 0;
            createAnimation(self, data);
        } else if ( k[1].includes('stab') ||  k[1].includes('swing') || k[1].includes('shoot') || k[1].includes('proneStab') ) {
            data["frameRate"] = 3;
            data["repeat"] = 0;
            createAnimation(self, data);
        } else {
            data["frameRate"] = 1.5;
            createAnimation(self, data);
        }
    };
};

function getAnimationKey(playerModel, key) {
    PLAYER_ALERT_KEY = playerModel + KEY_ALERT;
    return playerModel + '_' + key;
}

function createFramesArray(keyId, frameLength) {
    frames = [];
    for (var i=0; i <= frameLength; i++) {
        frames.push({key: keyId + "_" + i});
    };
    return frames;
}

function createAnimation(self, data) {
    self.anims.create({
        key: data["key"],
        frames: data["frames"],
        frameRate: data["frameRate"],
        repeat: data["repeat"]
    });
};

function playAnimation(self, animationKey, flipX = null) {
    if (ANIMATION_LOCK) return;
    if (flipX === true) {
        self.player.flipX = true;
    } else if (flipX === false) {
        self.player.flipX = false;
    }
    self.player.anims.play(animationKey, true);
    self.socket.emit('animationEvent', { key: animationKey, flipX: flipX });
};

function playerAlert(self, playerModel) {
    animationKey = getAnimationKey(playerModel, KEY_ALERT);
    playAnimation(self, animationKey);
};

function playerFly(self, playerModel) {
    animationKey = getAnimationKey(playerModel, KEY_FLY);
    playAnimation(self, animationKey);
};

function playerHeal(self, playerModel) {
    animationKey = getAnimationKey(playerModel, KEY_HEAL);
    playAnimation(self, animationKey);
};

function playerProne(self, playerModel) {
    animationKey = getAnimationKey(playerModel, KEY_PRONE);
    playAnimation(self, animationKey);
};
 
function playerProneStab(self, playerModel) {
    animationKey = getAnimationKey(playerModel, KEY_PRONE_STAB);
    playAnimation(self, animationKey);
    ANIMATION_LOCK = true;
    self.player.once('animationcomplete', function(){
        ANIMATION_LOCK = false;
    });
};

function playerClimb(self, playerModel, type = 1) {
    var key = type == 1 ? KEY_ROPE : KEY_LADDER;
    animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
};

function playerWalkRight(self, playerModel, twoHanded = false) {
    var key = twoHanded ? KEY_WALK2 : KEY_WALK1;
    animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey, true);
};

function playerWalkLeft(self, playerModel, twoHanded = false) {
    var key = twoHanded ? KEY_WALK2 : KEY_WALK1;
    animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey, false);
};

function playerStand(self, playerModel, twoHanded = false) {
    var key = twoHanded ? KEY_STAND2 : KEY_STAND1;
    animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
};

function playerJump(self, playerModel) { 
    animationKey = getAnimationKey(playerModel, KEY_JUMP);
    playAnimation(self, animationKey);
};

function playerShoot(self, playerModel, type = 1) {
    var key;
    switch (type) {
        case 1:
            key = KEY_SHOOT1;
            break;
        case 2:
            key = KEY_SHOOT2;
            break;
        case 'F':
            key = KEY_SHOOTF;
            break;
    }
    animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
    self.player.once('animationcomplete', function(){
        playerAlert(self, playerModel);
    });
};

function playerStab(self, playerModel, type = 1, twoHanded = false) {
    var key;
    if (twoHanded) {
        switch (type) {
            case 1:
                key = KEY_SPEAR1;
                break;
            case 2:
                key = KEY_SPEAR2;
                break;
            case 'F':
                key = KEY_SPEARF;
                break;
            case 'P1':
                key = KEY_POLEARM1;
                break;
            case 'P2':
                key = KEY_POLEARM2;
                break;
            case 'PF':
                key = KEY_POLEARMF;
                break;
        }
    } else {
        switch (type) {
            case 1:
                key = KEY_STAB1;
                break;
            case 2:
                key = KEY_STAB2;
                break;
            case 'F':
                key = KEY_STABF;
                break;
        }
    }
    animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
    ANIMATION_LOCK = true;
    self.player.once('animationcomplete', function(){
        ANIMATION_LOCK = false;
        playerAlert(self, playerModel);
    });
};

function playerSwing(self, playerModel, type = 1, twoHanded = false) {
    var key;
    if (twoHanded) {
        switch (type) {
            case 1:
                key = KEY_SWING1;
                break;
            case 2:
                key = KEY_SWING2;
                break;
            case 3:
                key = KEY_SWING3;
                break;
            case 'F':
                key = KEY_SWINGF;
                break;
        }
    } else {
        switch (type) {
            case 1:
                key = KEY_GREATSWORD1;
                break;
            case 2:
                key = KEY_GREATSWORD2;
                break;
            case 3:
                key = KEY_GREATSWORD3;
                break;
            case 'F':
                key = KEY_GREATSWORDF;
                break;
        }
    }
    animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
    self.player.once('animationcomplete', function(){
        playerAlert(self, playerModel);
    });
};

function playerPunch(self, playerModel) {
    playerStab(self, playerModel, randomInt(1, 3));
};