import { Entity } from '../entity.js';
import { make_image, rand_choice } from '../../utils.js';
import { MapDrawable } from '../../viewer.js';

class Bush extends Entity {
    constructor(subtile_x, subtile_y) {
        super(...arguments);
        this.resources = {
            food: 150
        };
        this.hp = Bush.prototype.HP;
        this.max_hp = Bush.prototype.HP;

        this.createSelectionRect();
        this.setImage();
        this.resetBoundingBox();
    }
    setImage() {
        this.image = new Konva.Image({
            x: -this.IMAGE_OFFSET.x,
            y: -this.IMAGE_OFFSET.y,
            image: this.IMAGE,
            width: this.IMAGE.width,
            height: this.IMAGE.height
        });
        this.add(this.image);
    }
    createSelectionRect() {
        super.createSelectionRect({
            x: -this.IMAGE_OFFSET.x,
            y: -this.IMAGE_OFFSET.y,
            width: this.IMAGE.width,
            height: this.IMAGE.height
        });
    }
    resetBoundingBox() {
        this.boundingBox = {
            x: this.x() - this.IMAGE_OFFSET.x,
            y: this.y() - this.IMAGE_OFFSET.y,
            w: this.image.width(),
            h: this.image.height()
        }
    }
    getBoundingBox() {
        return this.boundingBox;
    }
    height() {
        return this.image.height();
    }
    width() {
        return this.image.width();
    }
}
Bush.prototype.HP = 25;
Bush.SUBTILE_WIDTH = 1;
Bush.prototype.NAME = "Berry Bush";
Bush.prototype.AVATAR = make_image("img/interface/avatars/bush.png");

Bush.prototype.IMAGE = make_image("img/resources/bush.png");
Bush.prototype.IMAGE_OFFSET =  { x: 3, y: 25 };

export { Bush }