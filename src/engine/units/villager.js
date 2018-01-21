import { Unit } from './unit.js';
import { Building } from '../buildings/building.js';
import { Bush } from '../resources/bush.js';
import { make_image, leftpad, RESOURCE_TYPES } from '../../utils.js';
import { TERRAIN_TYPES } from '../terrain.js';
import { Actions } from '../actions.js';

class Villager extends Unit {
    constructor() {
        super(...arguments);
        this.attributes = {
            attack: Villager.prototype.ATTRIBUTES.ATTACK,
            food: 0,
            wood: 0,
            gold: 0,
            stone: 0
        }
        this.carriedResource = RESOURCE_TYPES.NONE;
    }
    initInteraction(engine) {
        if (this.interactionObject.destroyed) this.terminateInteraction();
        else if (this.interactionObject instanceof Building) {
            // TODO - check if its our or enymy's building
            if (this.carriedResource && this.interactionObject.acceptsResource(this.carriedResource)) {
                let res_name = this.RESOURCE_NAME[this.carriedResource];
                this.player.resources[res_name] += this.attributes[res_name];
                this.attributes[res_name] = 0;
                this.carriedResource = RESOURCE_TYPES.NONE;

                if (this.prevInteractionObject == null) {
                    this.terminateInteraction();
                    return;
                } else engine.interactOrder(this, this.prevInteractionObject);
                this.prevInteractionObject = null;
            } else if (this.interactionObject.isComplete) {
                // TODO - repair
                this.state = this.STATE.IDLE;
            } else {
                this.state = this.STATE.BUILDING;
                this.interaction_type = this.INTERACTION_TYPE.BUILDING;
            }
            this.rotateToEntity(this.interactionObject);
        } else if (this.interactionObject instanceof Bush) {
            this.state = this.STATE.FORAGE;
            this.interaction_type = this.INTERACTION_TYPE.FORAGE;
            this.rotateToEntity(this.interactionObject);
        } else {
            super.initInteraction();
        }
    }
    processInteraction(engine) {
        if (this.interaction_type == this.INTERACTION_TYPE.BUILDING) {
            if (this.interactionObject.isComplete || this.interactionObject.destroyed) this.terminateInteraction();
            else if (engine.framesCount % this.BUILD_RATE == 0) this.interactionObject.constructionTick();
        } else if (this.interaction_type == this.INTERACTION_TYPE.FORAGE) {
            if (engine.framesCount % this.FORAGE_RATE == 0) {
                if (this.interactionObject.destroyed) {
                    this.terminateInteraction() // TODO: find next berry bush
                } else {
                    this.attributes.food += this.interactionObject.getFood();
                    this.carriedResource = RESOURCE_TYPES.FOOD;
                    if (this.attributes.food == this.CAPACITY.FOOD) this.returnResources(engine);
                }
            }
        }
    }
    returnResources(engine) {
        let building = this.player.getNearestBuilding(this, { NAME: "Town Center" });
        this.prevInteractionObject = this.interactionObject;
        engine.interactOrder(this, building);
    }
    terminateInteraction() {
        this.state = this.STATE.IDLE;
        this.frame = 0;
        this.interactionObject = null;
        this.prevInteractionObject = null;
    }
}
Villager.SUBTILE_WIDTH = 1;
Villager.prototype.NAME = "Villager";
Villager.prototype.AVATAR = make_image("img/interface/avatars/villager.png");
Villager.prototype.HP = 25;
Villager.prototype.SPEED = 1;
Villager.prototype.BUILD_RATE = 3;
Villager.prototype.FORAGE_RATE = 60;
Villager.prototype.RESOURCE_NAME = ["", "", "", ""];
Villager.prototype.RESOURCE_NAME[RESOURCE_TYPES.FOOD] = "food";
Villager.prototype.RESOURCE_NAME[RESOURCE_TYPES.WOOD] = "wood";
Villager.prototype.RESOURCE_NAME[RESOURCE_TYPES.STONE] = "stone";
Villager.prototype.RESOURCE_NAME[RESOURCE_TYPES.GOLD] = "gold";

Villager.prototype.CAPACITY = {
    FOOD: 10,
    WOOD: 10,
    STONE: 10,
    GOLD: 10
}
Villager.prototype.SUPPORTED_TERRAIN = new Set([TERRAIN_TYPES.GRASS, TERRAIN_TYPES.SAND]);
Villager.prototype.ACTIONS = [
    Actions.Build,
    Actions.Repair,
    Actions.Stop
];
Villager.prototype.ATTRIBUTES = {
    ATTACK: 3
}
Villager.prototype.STATE = Object.assign({
    BUILDING: 3,
    FORAGE: 4,
}, Villager.prototype.STATE);

Villager.prototype.FRAME_RATE = {}
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.BUILDING] = 2;
Villager.prototype.FRAME_RATE[Villager.prototype.STATE.FORAGE] = 4;

Villager.prototype.INTERACTION_TYPE = {
    BUILDING: 0
}

Villager.prototype.IMAGES = {};
Villager.prototype.IMAGES[Villager.prototype.STATE.IDLE] = [
    [make_image("img/units/villager/idle/N.png")],
    [make_image("img/units/villager/idle/NE.png")],
    [make_image("img/units/villager/idle/E.png")],
    [make_image("img/units/villager/idle/SE.png")],
    [make_image("img/units/villager/idle/S.png")],
    [make_image("img/units/villager/idle/SW.png")],
    [make_image("img/units/villager/idle/W.png")],
    [make_image("img/units/villager/idle/NW.png")],
];
Villager.prototype.IMAGES[Villager.prototype.STATE.MOVING] = new Array(8).fill(null).map(() => []);
for (let dir = 0; dir < 8; ++dir) {
    for (let i = 0; i < 15; ++i) {
        Villager.prototype.IMAGES[Villager.prototype.STATE.MOVING][dir].push(
            make_image(`img/units/villager/moving/${Unit.prototype.DIRECTIONS[dir]}_${leftpad(i, 2, "0")}.png`)
        )
    }
}

Villager.prototype.IMAGES[Villager.prototype.STATE.BUILDING] = new Array(8).fill(null).map(() => []);
for (let dir = 0; dir < 8; ++dir) {
    for (let i = 0; i < 16; ++i) {
        Villager.prototype.IMAGES[Villager.prototype.STATE.BUILDING][dir].push(
            make_image(`img/units/villager/building/${Unit.prototype.DIRECTIONS[dir]}_${leftpad(i, 2, "0")}.png`)
        )
    }
}

Villager.prototype.IMAGES[Villager.prototype.STATE.FORAGE] = new Array(8).fill(null).map(() => []);
for (let dir = 0; dir < 8; ++dir) {
    for (let i = 0; i < 27; ++i) {
        Villager.prototype.IMAGES[Villager.prototype.STATE.FORAGE][dir].push(
            make_image(`img/units/villager/forage/${Unit.prototype.DIRECTIONS[dir]}_${leftpad(i, 2, "0")}.png`)
        )
    }
}

Villager.prototype.IMAGE_OFFSETS = {};
Villager.prototype.IMAGE_OFFSETS[Villager.prototype.STATE.IDLE] = { x: 0, y: 35 };
Villager.prototype.IMAGE_OFFSETS[Villager.prototype.STATE.MOVING] = { x: 9, y: 35 };
Villager.prototype.IMAGE_OFFSETS[Villager.prototype.STATE.BUILDING] = { x: 13, y: 37 };
Villager.prototype.IMAGE_OFFSETS[Villager.prototype.STATE.FORAGE] = { x: 21, y: 42 };


export { Villager }