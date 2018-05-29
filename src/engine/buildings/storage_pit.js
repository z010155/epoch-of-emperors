import { Building } from './building.js';
import { RESOURCE_TYPES } from '../../utils.js';
import { Sprites } from '../../sprites.js';

class StoragePit extends Building {
    acceptsResource(type) {
        return this.isComplete && (
            type == RESOURCE_TYPES.WOOD ||
            type == RESOURCE_TYPES.STONE ||
            type == RESOURCE_TYPES.GOLD
        );
    }
}
StoragePit.prototype.NAME = "Storage Pit";
StoragePit.prototype.AVATAR = Sprites.Sprite("img/interface/avatars/storage_pit_01_all.png");
StoragePit.prototype.MAX_HP = 350;
StoragePit.prototype.SUBTILE_WIDTH = 5;

StoragePit.prototype.ACTION_KEY = "S";
StoragePit.prototype.COST = {
    food: 0, wood: 120, stone: 0, gold: 0
}

StoragePit.prototype.IMAGES = {
    ...Building.prototype.IMAGES,
    [Building.prototype.STATE.DONE]: [Sprites.Sprite("img/buildings/storage_pit/01_all.png")],
    [Building.prototype.STATE.DENIED]: [Graphics.Filters.RedFilter(Sprites.Sprite("img/buildings/storage_pit/01_all.png"))]
}

StoragePit.prototype.IMAGE_OFFSETS = {
    ...Building.prototype.IMAGE_OFFSETS,
    [Building.prototype.STATE.DONE]: { x: 1, y: 64 }
}

StoragePit.prototype.HITMAP = {
    ...Building.prototype.HITMAP,
    [StoragePit.prototype.STATE.DONE]: Graphics.Filters.ComposeHitmask(
        Sprites.Sprite("img/buildings/base_hit_big.png"),
        Sprites.Sprite("img/buildings/storage_pit/01_all.png"),
        StoragePit.prototype.IMAGE_OFFSETS[Building.prototype.STATE.CONSTRUCTION],
        StoragePit.prototype.IMAGE_OFFSETS[Building.prototype.STATE.DONE]
    )
}

export { StoragePit }
