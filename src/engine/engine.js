import { MapFactory } from './map.js';
import { Unit } from './units/unit.js';
import { Villager } from './units/villager.js';
import { AStarPathFinder } from './algorithms.js';
import { Map } from './map.js';
import { distance } from '../utils.js'

class Engine {
    constructor(viewer, definition) {
        this.framesCount = 0;
        this.loop = null;
        this.viewer = viewer;
        this.definition = Object.assign({}, definition);
        
        this.map = MapFactory(this.definition.map);
        this.addSampleUnits();
    }
    processEntities() {
        for (let entity, i = 0; entity = this.map.entities[i++];) {
            if (entity.state == Unit.prototype.STATE.MOVING) {
                this.processMovingUnit(entity);
            } else if (entity.state == Unit.prototype.STATE.IDLE && entity.path != null) {
                this.processWaitingUnit(entity);
            }
        }
    }
    processMovingUnit(entity) {
        let tmp_target = this.viewer.mapDrawable.tileCoordsToScreen(
            entity.path[entity.path_progress].x / 2,
            entity.path[entity.path_progress].y / 2
        );
        if (distance(entity.realPosition, tmp_target) < entity.SPEED) {
            // transition between two subtiles is done which can be considered as done step
            if (entity.path_progress > 0) {
                // if first step was already done, we have to release previously occupied area
                this.map.fillSubtilesWith(entity.subtile_x, entity.subtile_y, entity.constructor.SUBTILE_WIDTH, null);
            }
            entity.subtile_x = entity.path[entity.path_progress].x;
            entity.subtile_y = entity.path[entity.path_progress].y;
            this.map.fillSubtilesWith(entity.subtile_x, entity.subtile_y, entity.constructor.SUBTILE_WIDTH, entity);
            ++entity.path_progress;

            if (entity.path_progress < entity.path.length) {
                // if there are further steps check if next area is unoccupied
                let entrance = this.canEnterSubtile(
                    entity.path[entity.path_progress].x,
                    entity.path[entity.path_progress].y,
                    entity
                );

                if (entrance == Engine.prototype.AREA_ENTRANCE_RESOLUTION.GO) {
                    // if destination area is not occupied allocate it
                    this.map.fillSubtilesWith(
                        entity.path[entity.path_progress].x,
                        entity.path[entity.path_progress].y,
                        entity.constructor.SUBTILE_WIDTH,
                        entity
                    );
                } else if (entrance == Engine.prototype.AREA_ENTRANCE_RESOLUTION.WAIT) {
                    // if area is temporarily taken wait until it frees
                    entity.state = Unit.prototype.STATE.IDLE;
                } else if (entrance == Engine.prototype.AREA_ENTRANCE_RESOLUTION.BYPASS) {
                    this.moveOrder(entity, entity.path[entity.path.length - 1]);
                }
            }
        }
        if (entity.path.length == entity.path_progress) {
            entity.path_progress = 0;
            entity.path = null;
            entity.frame = 0;
            entity.state = Unit.prototype.STATE.IDLE;
            entity.position(this.viewer.mapDrawable.tileCoordsToScreen(entity.subtile_x / 2, entity.subtile_y / 2));
        } else {
            let old_rotation = entity.rotation;
            entity.rotateToSubtile(entity.path[entity.path_progress]);
            if (old_rotation != entity.rotation) entity.frame = 0;

            entity.position({
                x: entity.realPosition.x + entity.SPEED * entity.DIRECTIONS_DELTA[entity.rotation].x,
                y: entity.realPosition.y + entity.SPEED * entity.DIRECTIONS_DELTA[entity.rotation].y
            });
        }
        entity.updateSprite();
        entity.resetBoundingBox();
        this.viewer.setEntityVisibility(entity);
        if (this.framesCount % 2) ++entity.frame;
    }
    processWaitingUnit(entity) {
        // process unit which is waiting for another unit to release currently desired area
        let entrance = this.canEnterSubtile(
            entity.path[entity.path_progress].x,
            entity.path[entity.path_progress].y,
            entity
        );

        if (entrance == Engine.prototype.AREA_ENTRANCE_RESOLUTION.GO) {
            entity.state = Unit.prototype.STATE.MOVING;
            this.map.fillSubtilesWith(
                entity.path[entity.path_progress].x,
                entity.path[entity.path_progress].y,
                entity.constructor.SUBTILE_WIDTH,
                entity
            );
        } else if (entrance == Engine.prototype.AREA_ENTRANCE_RESOLUTION.BYPASS) {
            this.moveOrder(entity, entity.path[entity.path.length - 1]);
        } else {
            // if unit is waiting for too long use randomized way of computing new route
            if (Math.random() > .85) ++entity.ticks_waited;
            if (entity.ticks_waited > Engine.prototype.UNIT_MAX_WAIT_TIME && Math.random() > .85) {
                entity.ticks_waited = 0;
                this.moveOrder(entity, entity.path[entity.path.length - 1]);
            }
        }
    }
    // check if subtile is not occupied by other entity
    canEnterSubtile(subtile_x, subtile_y, entity) {
        for (let x = subtile_x; x < subtile_x + entity.constructor.SUBTILE_WIDTH; ++x) {
            for (let y = subtile_y; y < subtile_y + entity.constructor.SUBTILE_WIDTH; ++y) {
                if (this.map.subtiles_map[x][y] != null && this.map.subtiles_map[x][y] != entity) {
                    if (this.map.subtiles_map[x][y].path != null) {
                        return Engine.prototype.AREA_ENTRANCE_RESOLUTION.WAIT
                    } else if (this.map.subtiles_map[x][y].state == Unit.prototype.STATE.IDLE) {
                        return Engine.prototype.AREA_ENTRANCE_RESOLUTION.BYPASS
                    }
                }
            }
        }
        return Engine.prototype.AREA_ENTRANCE_RESOLUTION.GO;
    }
    startLoop() {
        this.loop = window.setInterval(this.processLoop.bind(this), 1000 / this.frameRate);
    }
    processLoop() {
        ++this.framesCount;
        this.viewer.handleScroll();
        this.processEntities();
        this.viewer.stage.draw();
    }
    handleRightClick(point) {
        if (this.selectedEntity instanceof Unit) this.moveOrder(this.selectedEntity, point);
    }
    moveOrder(unit, point) {
        let finder = new AStarPathFinder(unit, this.map, point);
        let path = finder.run();
        if (path.length > 0) {
            if (unit.path == null) {
                // if unit currently has no path, just assign found path;
                unit.path = path;
                unit.path_progress = 0;
            } else {
                if (path[1].x == unit.path[unit.path_progress].x && path[1].y == unit.path[unit.path_progress].y) {
                    // use new path if it starts with the subtile which is current target of our step
                    unit.path = path;
                } else {
                    // otherwise go back to subtile which was beggining of our step and continue from there
                    unit.subtile_x = unit.path[unit.path_progress].x;
                    unit.subtile_y = unit.path[unit.path_progress].y;
                    unit.path = [unit.path[unit.path_progress]].concat(path);
                }
                unit.path_progress = 1;
            }
            unit.state = Unit.prototype.STATE.MOVING;
            unit.rotateToSubtile(unit.path[0]);
        }
    }
    addSampleUnits() {

    }
}
Engine.prototype.frameRate = 35;
Engine.prototype.AREA_ENTRANCE_RESOLUTION = {
    GO: 0, // area is not occupied - free to go
    WAIT: 1, // area is temporarily occupied - wait until it's free
    BYPASS: 2 // area was permanently taken - bypass needed
};
Engine.prototype.UNIT_MAX_WAIT_TIME = 15;

export {
    Engine
}