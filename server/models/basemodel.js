export class BaseModel {
    constructor(id, x, y, sprite) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
    }
}

export class BaseMonsterModel {
    constructor(id, x, y, monsterId, data) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.monsterId = monsterId;
        this.data = data
    }
}

export default BaseModel;