import * as KEY from './constants/animation.js';
import { randomInt } from '../utilities/math.js';

export var ANIMATION_LOCK = false;

export function getFramesFromArray(self, keys) {
    var data = {};
    for (var i=0; i < keys.length; i++) {
        var k = keys[i].split("_");
        var key = k[0] + "_" + k[1];
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
        var data = {
            "key": key,
            "frames": createFramesArray(key, keys[key]),
            "frameRate": 4,
            "repeat": -1
        };
        var k = key.split("_");
        if ([KEY.WALK1, KEY.WALK2].includes(k[1])) {
            data["frameRate"] = 6;
            createAnimation(self, data);
        } else if ([KEY.STAND1, KEY.STAND2].includes(k[1])) {
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
    var PLAYER_ALERT_KEY = playerModel + KEY.ALERT;
    return playerModel + '_' + key;
}

function createFramesArray(keyId, frameLength) {
    var frames = [];
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
        self.players[self.socket.id].flipX = true;
    } else if (flipX === false) {   
        self.players[self.socket.id].flipX = false;
    }
    self.players[self.socket.id].anims.play(animationKey, true);
    self.socket.emit('animationEvent', { key: animationKey, flipX: flipX }, self.room);
};

export function playerAlert(self, playerModel) {
    var animationKey = getAnimationKey(playerModel, KEY.ALERT);
    playAnimation(self, animationKey);
};

export function playerFly(self, playerModel) {
    var animationKey = getAnimationKey(playerModel, KEY.FLY);
    playAnimation(self, animationKey);
};

export function playerHeal(self, playerModel) {
    var animationKey = getAnimationKey(playerModel, KEY.HEAL);
    playAnimation(self, animationKey);
};

export function playerProne(self, playerModel) {
    var animationKey = getAnimationKey(playerModel, KEY.PRONE);
    playAnimation(self, animationKey);
};
 
export function playerProneStab(self, playerModel) {
    var animationKey = getAnimationKey(playerModel, KEY.PRONE_STAB);
    playAnimation(self, animationKey);
    ANIMATION_LOCK = true;
    self.players[self.socket.id].once('animationcomplete', function(){
        ANIMATION_LOCK = false;
    });
};

export function playerClimb(self, playerModel, type = 1) {
    var key = type == 1 ? KEY.ROPE : KEY.LADDER;
    var animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
};

export function playerWalkRight(self, playerModel, twoHanded = false) {
    var key = twoHanded ? KEY.WALK2 : KEY.WALK1;
    var animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey, true);
};

export function playerWalkLeft(self, playerModel, twoHanded = false) {
    var key = twoHanded ? KEY.WALK2 : KEY.WALK1;
    var animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey, false);
};

export function playerStand(self, playerModel, twoHanded = false) {
    var key = twoHanded ? KEY.STAND2 : KEY.STAND1;
    var animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
};

export function playerJump(self, playerModel) { 
    var animationKey = getAnimationKey(playerModel, KEY.JUMP);
    playAnimation(self, animationKey);
};

export function playerShoot(self, playerModel, type = 1) {
    var key;
    switch (type) {
        case 1:
            key = KEY.SHOOT1;
            break;
        case 2:
            key = KEY.SHOOT2;
            break;
        case 'F':
            key = KEY.SHOOTF;
            break;
    }
    var animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
    self.players[self.socket.id].once('animationcomplete', function(){
        playerAlert(self, playerModel);
    });
};

export function playerStab(self, playerModel, type = 1, twoHanded = false) {
    var key;
    if (twoHanded) {
        switch (type) {
            case 1:
                key = KEY.SPEAR1;
                break;
            case 2:
                key = KEY.SPEAR2;
                break;
            case 'F':
                key = KEY.SPEARF;
                break;
            case 'P1':
                key = KEY.POLEARM1;
                break;
            case 'P2':
                key = KEY.POLEARM2;
                break;
            case 'PF':
                key = KEY.POLEARMF;
                break;
        }
    } else {
        switch (type) {
            case 1:
                key = KEY.STAB1;
                break;
            case 2:
                key = KEY.STAB2;
                break;
            case 'F':
                key = KEY.STABF;
                break;
        }
    }
    var animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
    ANIMATION_LOCK = true;
    self.players[self.socket.id].once('animationcomplete', function(){
        ANIMATION_LOCK = false;
        playerAlert(self, playerModel);
    });
};

export function playerSwing(self, playerModel, type = 1, twoHanded = false) {
    var key;
    if (twoHanded) {
        switch (type) {
            case 1:
                key = KEY.SWING1;
                break;
            case 2:
                key = KEY.SWING2;
                break;
            case 3:
                key = KEY.SWING3;
                break;
            case 'F':
                key = KEY.SWINGF;
                break;
        }
    } else {
        switch (type) {
            case 1:
                key = KEY.GREATSWORD1;
                break;
            case 2:
                key = KEY.GREATSWORD2;
                break;
            case 3:
                key = KEY.GREATSWORD3;
                break;
            case 'F':
                key = KEY.GREATSWORDF;
                break;
        }
    }
    var animationKey = getAnimationKey(playerModel, key);
    playAnimation(self, animationKey);
    self.players[self.socket.id].once('animationcomplete', function(){
        playerAlert(self, playerModel);
    });
};

export function playerPunch(self, playerModel) {
    playerStab(self, playerModel, randomInt(1, 3));
};