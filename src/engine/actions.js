import { TownCenter } from './buildings/town_center';
import { Barracks } from './buildings/barracks.js';
import { ArcheryRange } from './buildings/archery_range.js';
import { Stable } from './buildings/stable.js';
import { Farm } from './buildings/farm.js';
import { StoragePit } from './buildings/storage_pit.js';
import { Dock } from './buildings/dock.js';
import { Granary } from './buildings/granary.js';
import { Market } from './buildings/market.js';
import { Wall } from './buildings/wall.js';
import { House } from './buildings/house.js';
import { Unit } from './units/unit.js';
import { RESOURCE_TYPES, RESOURCE_NAME, rand_choice } from '../utils.js';
import { Sprites } from '../sprites.js';
import { Action } from './base_action.js';

class RejectConstructionPlan extends Action {
    execute() {
        this.viewer.constructionIndicator.removeChildren();
        this.viewer.bottombar.entityActions.popActions();
        this.viewer.isPlanningConstruction = false;
    }
}
RejectConstructionPlan.prototype.IMAGE = Sprites.Sprite("img/interface/command/cancel.png");
RejectConstructionPlan.prototype.TOOLTIP = "Cancel";
RejectConstructionPlan.prototype.ACTION_KEY = "Esc";
RejectConstructionPlan.prototype.POS = {
    x: (Action.prototype.SIZE + Action.prototype.MARGIN * 2) * Action.prototype.ACTIONS_PER_ROW + Action.prototype.MARGIN,
    y: Action.prototype.SIZE + Action.prototype.MARGIN * 2
}


function CreateBuildingFactory(Building) {
    class CreateBuilding extends Action {
        execute() {
            if (this.checkCost(this.BUILDING.prototype.COST) == false) return;
            this.viewer.isPlanningConstruction = true;
            this.viewer.bottombar.entityActions.pushActions(this.ACTIONS);
            this.viewer.constructionIndicator.setBuilding(this.BUILDING);
            this.viewer.constructionIndicator.on("confirm", this.confirmConstruction.bind(this));
            this.viewer.constructionIndicator.on("reject", this.rejectConstruction.bind(this));
        }
        getCost() {
            return this.BUILDING.prototype.COST;
        }
        static getImage(entity) {
            return Building.prototype.AVATAR[entity.player.civ][entity.player.age];
        }
        confirmConstruction(e) {
            if (!this.viewer.constructionIndicator.allow_construction) return;
            if (this.checkCost(this.BUILDING.prototype.COST) == false) return;
            this.player.subtractResources(this.BUILDING.prototype.COST);

            let sub = this.viewer.constructionIndicator.sub;
            let building = new this.BUILDING(sub.x, sub.y, this.player);
            building.level = this.player.age;
            this.viewer.engine.addBuilding(building);
            this.viewer.addEntity(building);
            this.viewer.bottombar.entityActions.goToFirst();
            this.viewer.isPlanningConstruction = false;
            this.viewer.constructionIndicator.hide();
            if (this.viewer.engine.selectedEntity) {
                this.viewer.engine.interactOrder(this.viewer.engine.selectedEntity, building);
            }
        }
        rejectConstruction(e) {
            this.viewer.bottombar.entityActions.popActions();
            this.viewer.isPlanningConstruction = false;
            this.viewer.constructionIndicator.hide();
        }
    }
    CreateBuilding.prototype.BUILDING = Building;
    CreateBuilding.prototype.TOOLTIP = `Build ${Building.prototype.NAME}`;
    if (Building.prototype.CONTINUOUS_PREVIEW) CreateBuilding.prototype.TOOLTIP += " (drag-n-drop)"
    CreateBuilding.prototype.ACTION_KEY = Building.prototype.ACTION_KEY;
    CreateBuilding.prototype.ACTIONS = [
        RejectConstructionPlan
    ];
    return CreateBuilding;
}

class PreviousPage extends Action {
    execute() {
        this.viewer.bottombar.entityActions.popActions();
    }
}
PreviousPage.prototype.IMAGE = Sprites.Sprite("img/interface/command/next.png");
PreviousPage.prototype.TOOLTIP = "Previous";
PreviousPage.prototype.ACTION_KEY = "X";
PreviousPage.prototype.POS = {
    x: (Action.prototype.SIZE + Action.prototype.MARGIN * 2) * Action.prototype.ACTIONS_PER_ROW + Action.prototype.MARGIN,
    y: 0
}

class FirstPage extends Action {
    execute() {
        this.viewer.bottombar.entityActions.goToFirst();
    }
}
FirstPage.prototype.IMAGE = Sprites.Sprite("img/interface/command/cancel.png");
FirstPage.prototype.TOOLTIP = "Cancel";
FirstPage.prototype.ACTION_KEY = "Esc";
FirstPage.prototype.POS = {
    x: (Action.prototype.SIZE + Action.prototype.MARGIN * 2) * Action.prototype.ACTIONS_PER_ROW + Action.prototype.MARGIN,
    y: Action.prototype.SIZE + Action.prototype.MARGIN * 2
}

class NextBuildingsPage extends Action {
    execute() {
        this.viewer.bottombar.entityActions.pushActions(this.ACTIONS);
    }
}
NextBuildingsPage.prototype.IMAGE = Sprites.Sprite("img/interface/command/next.png");
NextBuildingsPage.prototype.TOOLTIP = "Next";
NextBuildingsPage.prototype.ACTION_KEY = "X";
NextBuildingsPage.prototype.POS = {
    x: (Action.prototype.SIZE + Action.prototype.MARGIN * 2) * Action.prototype.ACTIONS_PER_ROW + Action.prototype.MARGIN,
    y: 0
}
NextBuildingsPage.prototype.ACTIONS = [
    CreateBuildingFactory(Market),
    CreateBuildingFactory(TownCenter),
    PreviousPage,
    FirstPage,
];

class StandGround extends Action {
}
StandGround.prototype.IMAGE = Sprites.Sprite("img/interface/command/stand_ground.png");
StandGround.prototype.TOOLTIP = "Stand Ground";
StandGround.prototype.ACTION_KEY = "D";


class Build extends Action {
    execute() {
        this.viewer.bottombar.entityActions.pushActions(this.ACTIONS);
    }
}
Build.prototype.IMAGE = Sprites.Sprite("img/interface/command/build.png");
Build.prototype.TOOLTIP = "Build";
Build.prototype.ACTION_KEY = "B";
Build.prototype.ACTIONS = [
    CreateBuildingFactory(House),
    CreateBuildingFactory(Barracks),
    CreateBuildingFactory(Granary),
    CreateBuildingFactory(StoragePit),
    CreateBuildingFactory(Dock),
    CreateBuildingFactory(ArcheryRange),
    CreateBuildingFactory(Stable),
    CreateBuildingFactory(Farm),
    CreateBuildingFactory(Wall),
    NextBuildingsPage,
    FirstPage
];


class Repair extends Action {
}
Repair.prototype.IMAGE = Sprites.Sprite("img/interface/command/repair.png");
Repair.prototype.TOOLTIP = "Repair";
Repair.prototype.ACTION_KEY = "R";

class Stop extends Action {
    static isVisible(entity) {
        return !(entity.state & Unit.prototype.STATE.IDLE);
    }
}
Stop.prototype.IMAGE = Sprites.Sprite("img/interface/command/stop.png");
Stop.prototype.TOOLTIP = "Stop";
Stop.prototype.ACTION_KEY = "S";


class Trade extends Action {
    execute() {
        this.entity.attributes[RESOURCE_NAME[this.entity.tradedResource]] = null;
        this.entity.tradedResource = this.RESOURCE;
        if (this.entity.attributes.gold == null) this.entity.attributes[RESOURCE_NAME[this.entity.tradedResource]] = "";
    }
}

class TradeFood extends Trade {
}
TradeFood.prototype.IMAGE = Sprites.Sprite("img/interface/command/trade_food.png");
TradeFood.prototype.TOOLTIP = "Trade food for gold."
TradeFood.prototype.RESOURCE = RESOURCE_TYPES.FOOD;

class TradeWood extends Trade {
}
TradeWood.prototype.IMAGE = Sprites.Sprite("img/interface/command/trade_wood.png");
TradeWood.prototype.TOOLTIP = "Trade wood for gold."
TradeWood.prototype.RESOURCE = RESOURCE_TYPES.WOOD;

class TradeStone extends Trade {
}
TradeStone.prototype.IMAGE = Sprites.Sprite("img/interface/command/trade_stone.png");
TradeStone.prototype.TOOLTIP = "Trade stone for gold."
TradeStone.prototype.RESOURCE = RESOURCE_TYPES.STONE;


function RecruitUnitFactory(Unit) {
    class RecruitUnit extends Action {
        execute() {
            if (this.checkCost(this.UNIT.prototype.COST) == false) return;
            this.player.subtractResources(this.UNIT.prototype.COST);
            this.entity.addTask(this);
        }
        init() {
            if (this.player.population >= this.player.max_population) {
                if (!this.failed) this.viewer.setErrorMessage('You need to build more houses.');
                this.failed = true;
                return false;
            } else {
                this.failed = false;
                return true;
            }
        }
        finalize() {
            let pos = this.findEmptyArea(this.UNIT.prototype.SUBTILE_WIDTH);
            if (pos == null) {
                if (!this.failed) this.viewer.setErrorMessage('Not enough room to place unit.');
                this.failed = true;
                return false;
            }
            if (this.player.population >= this.player.max_population) {
                if (!this.failed) this.viewer.setErrorMessage('You need to build more houses.');
                this.failed = true;
                return false;
            }

            let unit = new this.UNIT(pos.x, pos.y, this.player, this.player.defaultEntityLevel[Unit.name]);
            this.viewer.engine.addUnit(unit);
            this.viewer.addEntity(unit);
            return true;
        }
        getCost() {
            return this.UNIT.prototype.COST;
        }
        static getImage(entity) {
            return Unit.prototype.AVATAR[entity.player.defaultEntityLevel[Unit.name] || 0];
        }
        time() {
            return this.UNIT.prototype.CREATION_TIME;
        }
        findEmptyArea(width) {
            // iterate clockwise around all available areas adjecent to building
            // find those which are empty afterwards randomly pick one
            let start, curr;
            start = curr = {
                x: this.entity.subtile_x - width,
                y: this.entity.subtile_y - width
            };
            let directions = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
            let curr_dir = 0;
            let possible_areas = [];
            do {
                let dir = directions[curr_dir];
                let dest = {
                    x: curr.x + (this.entity.SUBTILE_WIDTH + width) * dir.x,
                    y: curr.y + (this.entity.SUBTILE_WIDTH + width) * dir.y
                }
                do {
                    let terrain_counts = this.viewer.engine.map.countTerrainTiles(curr.x, curr.y, width);
                    let allowed_terrain = true;
                    for (let terrain of terrain_counts.keys())
                        if (!this.UNIT.prototype.SUPPORTED_TERRAIN.has(terrain)) allowed_terrain = false;

                    let empty = this.viewer.engine.map.areSubtilesEmpty(curr.x, curr.y, width);
                    if (empty && allowed_terrain) {
                        possible_areas.push(curr);
                    }
                    curr = { x: curr.x + 1 * dir.x, y: curr.y + 1 * dir.y };
                } while (curr.x != dest.x || curr.y != dest.y);
                ++curr_dir;
            } while (start.x != curr.x || start.y != curr.y);

            return rand_choice(possible_areas);
        }
        toolTipChunks(player) {
            return [this.TOOLTIP, Unit.prototype.NAME[player.defaultEntityLevel[Unit.name] || 0]];
        }
    }
    RecruitUnit.prototype.TOOLTIP = "Create";
    RecruitUnit.prototype.ACTION_KEY = Unit.prototype.ACTION_KEY;
    RecruitUnit.prototype.UNIT = Unit;
    RecruitUnit.prototype.SUPPORTS_QUEUE = true;
    RecruitUnit.prototype.HASH = Unit.name;
    return RecruitUnit;
}


const Actions = {
    StandGround, Build, Repair, Stop, RecruitUnitFactory,
    TradeFood, TradeWood, TradeStone
}

export { Actions, Action }
