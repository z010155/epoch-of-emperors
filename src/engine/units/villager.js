import { Unit } from './unit.js';
import { Building } from '../buildings/building.js';
import { Farm } from '../buildings/farm.js';
import { GoldMine } from '../resources/gold.js';
import { StoneMine } from '../resources/stone.js';
import { Bush } from '../resources/bush.js';
import { Animal } from './animal.js';
import { Tree } from '../trees.js';
import { Sprites } from '../../sprites.js';
import { RESOURCE_TYPES, RESOURCE_NAME } from '../../utils.js';
import { TERRAIN_TYPES } from '../terrain.js';
import { Actions } from '../actions.js';
import { Spear } from '../projectiles.js';
import * as interactions from '../interactions.js';

class Villager extends Unit {
    constructor() {
        super(...arguments);
        this.attributes = {
            attack: Villager.prototype.ATTRIBUTES.ATTACK,
            food: null,
            wood: null,
            gold: null,
            stone: null
        }
        this.carriedResource = RESOURCE_TYPES.NONE;
    }
    get ACTIONS() {
        if (this.state & Unit.prototype.STATE.IDLE) return [
            Actions.Build, Actions.Repair
        ]; else return [
            Actions.Build, Actions.Repair, Actions.Stop
        ];
    }
    getInteractionType(object) {
        // TODO: check if its our farm or emymy's
        if (object instanceof Farm && object.isComplete) return interactions.FarmingInteraction;
        // TODO: check if its our building or emymy's
        else if (object instanceof Building) {
            if (this.carriedResource && object.acceptsResource(this.carriedResource)) return interactions.ReturnResourcesInteraction;
            else if (object.hp < object.MAX_HP) return interactions.BuilderInteraction;
        } else if (object instanceof Tree) {
            if (object.state == Tree.prototype.STATE.ALIVE) return interactions.LumberInteraction;
            else return interactions.ChopInteraction;
        } else if (object instanceof Bush) return interactions.ForageInteraction;
        else if (object instanceof GoldMine) return interactions.GoldMineInteraction;
        else if (object instanceof StoneMine) return interactions.StoneMineInteraction;
        else if (object instanceof Animal) {
            if (object.hp > 0) return interactions.HunterInteraction;
            else return interactions.ButcherInteraction;
        }
    }
    getProjectileOffset() {
        return { x: 16, y: -30 }
    }
}
Villager.prototype.SUBTILE_WIDTH = 1;
Villager.prototype.NAME = "Villager";
Villager.prototype.AVATAR = Sprites.Sprite("img/interface/avatars/villager.png");
Villager.prototype.MAX_HP = 25;
Villager.prototype.SPEED = 1;
Villager.prototype.CREATION_TIME = 20 * 35;

Villager.prototype.ACTION_KEY = "C";
Villager.prototype.COST = {
    food: 50, wood: 0, stone: 0, gold: 0
}

Villager.prototype.CAPACITY = {
    [RESOURCE_NAME[RESOURCE_TYPES.FOOD]]: 10,
    [RESOURCE_NAME[RESOURCE_TYPES.WOOD]]: 10,
    [RESOURCE_NAME[RESOURCE_TYPES.STONE]]: 10,
    [RESOURCE_NAME[RESOURCE_TYPES.GOLD]]: 10
}
Villager.prototype.SUPPORTED_TERRAIN = new Set([TERRAIN_TYPES.GRASS, TERRAIN_TYPES.SAND]);
Villager.prototype.ATTRIBUTES = {
    ATTACK: 3
}

Villager.prototype.STATE = Object.assign({}, Villager.prototype.STATE);
Villager.prototype.STATE.BUILDING = 2 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.BUILDING_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.BUILDING;
Villager.prototype.STATE.BUILDING_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.BUILDING;

Villager.prototype.STATE.FORAGE = 3 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.FORAGE_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.FORAGE;
Villager.prototype.STATE.FORAGE_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.FORAGE;

Villager.prototype.STATE.LUMBER = 4 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.LUMBER_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.LUMBER;
Villager.prototype.STATE.LUMBER_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.LUMBER;

Villager.prototype.STATE.CHOP = 5 << Unit.prototype.BASE_STATE_MASK_WIDTH;

Villager.prototype.STATE.CARRY_WOOD = 6 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.CARRY_WOOD_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.CARRY_WOOD;
Villager.prototype.STATE.CARRY_WOOD_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.CARRY_WOOD;

Villager.prototype.STATE.MINE = 7 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.MINE_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.MINE;
Villager.prototype.STATE.MINE_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.MINE;

Villager.prototype.STATE.CARRY_GOLD = 8 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.CARRY_GOLD_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.CARRY_GOLD;
Villager.prototype.STATE.CARRY_GOLD_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.CARRY_GOLD;

Villager.prototype.STATE.CARRY_STONE = 9 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.CARRY_STONE_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.CARRY_STONE;
Villager.prototype.STATE.CARRY_STONE_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.CARRY_STONE;

Villager.prototype.STATE.FARMER = 10 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.FARMER_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.FARMER;
Villager.prototype.STATE.FARMER_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.FARMER;

Villager.prototype.STATE.CARRY_FARM = 11 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.CARRY_FARM_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.CARRY_FARM;
Villager.prototype.STATE.CARRY_FARM_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.CARRY_FARM;

Villager.prototype.STATE.HUNTER = 12 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.HUNTER_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.HUNTER;
Villager.prototype.STATE.HUNTER_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.HUNTER;

Villager.prototype.STATE.BUTCHER = 13 << Unit.prototype.BASE_STATE_MASK_WIDTH;

Villager.prototype.STATE.CARRY_MEAT = 14 << Unit.prototype.BASE_STATE_MASK_WIDTH;
Villager.prototype.STATE.CARRY_MEAT_IDLE = Villager.prototype.STATE.IDLE | Villager.prototype.STATE.CARRY_MEAT;
Villager.prototype.STATE.CARRY_MEAT_MOVING = Villager.prototype.STATE.MOVING | Villager.prototype.STATE.CARRY_MEAT;


Villager.prototype.FRAME_RATE = Object.assign({}, Unit.prototype.FRAME_RATE);
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.BUILDING] = 2;
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.FORAGE] = 4;
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.LUMBER] = 3;
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.CHOP] = 3;
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.MINE] = 3;
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.FARMER] = 3;
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.HUNTER] = 2;
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.BUTCHER] = 4;

Villager.prototype.IMAGES = {
    [Villager.prototype.STATE.IDLE]: Sprites.DirectionSprites("img/units/villager/idle/", 1),
    [Villager.prototype.STATE.BUILDING_IDLE]: Sprites.DirectionSprites("img/units/villager/builder_idle/", 1),
    [Villager.prototype.STATE.FORAGE_IDLE]: Sprites.DirectionSprites("img/units/villager/forage_idle/", 1),
    [Villager.prototype.STATE.LUMBER_IDLE]: Sprites.DirectionSprites("img/units/villager/lumber_idle/", 1),
    [Villager.prototype.STATE.CARRY_WOOD_IDLE]: Sprites.DirectionSprites("img/units/villager/carry_wood/", 1, 12),
    [Villager.prototype.STATE.MINE_IDLE]: Sprites.DirectionSprites("img/units/villager/mine_idle/", 1),
    [Villager.prototype.STATE.CARRY_GOLD_IDLE]: Sprites.DirectionSprites("img/units/villager/carry_gold/", 1, 12),
    [Villager.prototype.STATE.CARRY_STONE_IDLE]: Sprites.DirectionSprites("img/units/villager/carry_stone/", 1, 12),
    [Villager.prototype.STATE.FARMER_IDLE]: Sprites.DirectionSprites("img/units/villager/farmer_idle/", 1),
    [Villager.prototype.STATE.CARRY_FARM_IDLE]: Sprites.DirectionSprites("img/units/villager/carry_farm/", 1, 12),
    [Villager.prototype.STATE.HUNTER_IDLE]: Sprites.DirectionSprites("img/units/villager/hunter_idle/", 1),
    [Villager.prototype.STATE.CARRY_MEAT_IDLE]: Sprites.DirectionSprites("img/units/villager/carry_meat/", 1, 12),
    [Villager.prototype.STATE.MOVING]: Sprites.DirectionSprites("img/units/villager/moving/", 15),
    [Villager.prototype.STATE.BUILDING]: Sprites.DirectionSprites("img/units/villager/building/", 16),
    [Villager.prototype.STATE.BUILDING_MOVING]: Sprites.DirectionSprites("img/units/villager/builder_moving/", 15),
    [Villager.prototype.STATE.FORAGE]: Sprites.DirectionSprites("img/units/villager/forage/", 27),
    [Villager.prototype.STATE.FORAGE_MOVING]: Sprites.DirectionSprites("img/units/villager/forage_moving/", 15),
    [Villager.prototype.STATE.LUMBER]: Sprites.DirectionSprites("img/units/villager/lumber/", 11),
    [Villager.prototype.STATE.LUMBER_MOVING]: Sprites.DirectionSprites("img/units/villager/lumber_moving/", 15),
    [Villager.prototype.STATE.CHOP]: Sprites.DirectionSprites("img/units/villager/chop/", 15),
    [Villager.prototype.STATE.CARRY_WOOD_MOVING]: Sprites.DirectionSprites("img/units/villager/carry_wood/", 15),
    [Villager.prototype.STATE.MINE]: Sprites.DirectionSprites("img/units/villager/mine/", 13),
    [Villager.prototype.STATE.MINE_MOVING]: Sprites.DirectionSprites("img/units/villager/mine_moving/", 15),
    [Villager.prototype.STATE.CARRY_GOLD_MOVING]: Sprites.DirectionSprites("img/units/villager/carry_gold/", 15),
    [Villager.prototype.STATE.CARRY_STONE_MOVING]: Sprites.DirectionSprites("img/units/villager/carry_stone/", 15),
    [Villager.prototype.STATE.FARMER]: Sprites.DirectionSprites("img/units/villager/farming/", 29),
    [Villager.prototype.STATE.FARMER_MOVING]: Sprites.DirectionSprites("img/units/villager/farmer_moving/", 15),
    [Villager.prototype.STATE.CARRY_FARM_MOVING]: Sprites.DirectionSprites("img/units/villager/carry_farm/", 15),
    [Villager.prototype.STATE.HUNTER]: Sprites.DirectionSprites("img/units/villager/hunter/", 23),
    [Villager.prototype.STATE.HUNTER_MOVING]: Sprites.DirectionSprites("img/units/villager/hunter_moving/", 15),
    [Villager.prototype.STATE.BUTCHER]: Sprites.DirectionSprites("img/units/villager/butcher/", 12),
    [Villager.prototype.STATE.CARRY_MEAT_MOVING]: Sprites.DirectionSprites("img/units/villager/carry_meat/", 15)
}

Villager.prototype.IMAGE_OFFSETS = {
    [Villager.prototype.STATE.IDLE]: { x: -5, y: 33 },
    [Villager.prototype.STATE.MOVING]: { x: 2, y: 33 },

    [Villager.prototype.STATE.BUILDING]: { x: 8, y: 31 },
    [Villager.prototype.STATE.BUILDING_IDLE]: { x: -5, y: 32 },
    [Villager.prototype.STATE.BUILDING_MOVING]: { x: 2, y: 33 },

    [Villager.prototype.STATE.FORAGE]: { x: 17, y: 39 },
    [Villager.prototype.STATE.FORAGE_IDLE]: { x: 1, y: 31 },
    [Villager.prototype.STATE.FORAGE_MOVING]: { x: 7, y: 33 },

    [Villager.prototype.STATE.LUMBER]: { x: 1, y: 46 },
    [Villager.prototype.STATE.LUMBER_IDLE]: { x: 1, y: 32 },
    [Villager.prototype.STATE.LUMBER_MOVING]: { x: 3, y: 33 },

    [Villager.prototype.STATE.CHOP]: { x: 17, y: 43 },
    [Villager.prototype.STATE.CARRY_WOOD_MOVING]: { x: 4, y: 32 },
    [Villager.prototype.STATE.CARRY_WOOD_IDLE]: { x: 4, y: 32 },

    [Villager.prototype.STATE.MINE]: { x: 14, y: 45 },
    [Villager.prototype.STATE.MINE_IDLE]: { x: 0, y: 31 },
    [Villager.prototype.STATE.MINE_MOVING]: { x: 6, y: 32 },

    [Villager.prototype.STATE.CARRY_GOLD_MOVING]: { x: 0, y: 32 },
    [Villager.prototype.STATE.CARRY_GOLD_IDLE]: { x: 0, y: 32 },

    [Villager.prototype.STATE.CARRY_STONE_MOVING]: { x: 0, y: 33 },
    [Villager.prototype.STATE.CARRY_STONE_IDLE]: { x: 0, y: 33 },

    [Villager.prototype.STATE.FARMER]: { x: 12, y: 34 },
    [Villager.prototype.STATE.FARMER_IDLE]: { x: -3, y: 35 },
    [Villager.prototype.STATE.FARMER_MOVING]: { x: 12, y: 37 },

    [Villager.prototype.STATE.CARRY_FARM_IDLE]: { x: 7, y: 35 },
    [Villager.prototype.STATE.CARRY_FARM_MOVING]: { x: 7, y: 35 },

    [Villager.prototype.STATE.HUNTER]: { x: 29, y: 54 },
    [Villager.prototype.STATE.HUNTER_IDLE]: { x: 17, y: 32 },
    [Villager.prototype.STATE.HUNTER_MOVING]: { x: 10, y: 41 },

    [Villager.prototype.STATE.BUTCHER]: { x: 11, y: 32 },
    [Villager.prototype.STATE.CARRY_MEAT_MOVING]: { x: -1, y: 34 },
    [Villager.prototype.STATE.CARRY_MEAT_IDLE]: { x: -1, y: 34 },
};


export { Villager }
