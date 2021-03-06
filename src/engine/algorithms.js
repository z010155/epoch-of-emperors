class BFSWalker {
    constructor(seed, queue, visitor, node_getter, extra_condition=null, lowerBound=NaN, upperBound=NaN) {
        this.visited = {};
        this.queue = queue;
        this.visitor = visitor;
        this.extra_condition = extra_condition || function() {};
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.node_getter = node_getter;
        this.setVisited(seed.x, seed.y);
        this.queue.push(seed);
    }
    run() {
        let current;
        while(!(this.queue.empty() || this.extra_condition())) {
            current = this.queue.pop();
            this.visitor(current);
            this.enqueueNeighbours(current);
        }
    }
    enqueueNeighbours(node) {
        for (let delta of BFSWalker.NEIGHBOURS_DELTA) {
            if (!this.isVisited(node.x + delta.x, node.y + delta.y)) {
                this.queue.push(this.node_getter(node.x + delta.x, node.y + delta.y, node));
                this.setVisited(node.x + delta.x, node.y + delta.y);
            }
        }
    }
    isVisited(x, y) {
        if (this.visited[(x << 16) | y]) return true;
        if (x > this.upperBound || x < this.lowerBound || y < this.lowerBound || y > this.upperBound) return true;
        return false;
    }
    setVisited(x, y) {
        this.visited[(x << 16) | y] = true;
    }
}
BFSWalker.NEIGHBOURS_DELTA = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];

class MultiSlotQueue {
    constructor(numOfSlots=5) {
        this.numOfSlots = numOfSlots;
        this.slots = [];
        for (let i = 0; i < this.numOfSlots; ++i) {
            this.slots.push({
               head: 0,
               values: []
            });
        }
    }
    empty() {
        for (let i = 0; i < this.numOfSlots; ++i) {
            if (this.slots[i].values.length > this.slots[i].head) return false;
        }
        return true;
    }
    push(value) {
        let num = Math.floor(Math.random() * this.numOfSlots);
        this.slots[num].values.push(value);
    }
    pop() {
        for (let i = 0; i < this.numOfSlots; ++i) {
            if (this.slots[i].values.length > this.slots[i].head) {
                return this.slots[i].values[this.slots[i].head++];
            }
        }
        throw new Error();
    }
}


class StandardQueue {
    constructor() {
        this.values = [];
        this.head = 0;
    }
    empty() {
        return !(this.values.length > this.head);
    }
    push(value) {
        this.values.push(value);
    }
    pop() {
        return this.values[this.head++];
    }
}


class HeapQueue {
    constructor() {
        this.nodes = {};
        this.size = 0;
    }
    push(obj) {
        ++this.size;
        this.nodes[this.size] = obj;
        if (this.size > 1) this.fix_up(this.size);
    }
    fix_up(idx) {
        let parent_idx = Math.floor(idx / 2);
        if (this.nodes[parent_idx].priority > this.nodes[idx].priority) {
            this.swap(parent_idx, idx);
            if (parent_idx > 1) this.fix_up(parent_idx);
        }
    }
    fix_down(idx) {
        let hasLeft = idx * 2 <= this.size;
        let hasRight = idx * 2 + 1 <= this.size;

        if (hasLeft) {
            if (hasRight) {
                if (this.nodes[idx * 2].priority < this.nodes[idx * 2 + 1].priority) {
                    if (this.nodes[idx * 2].priority < this.nodes[idx].priority) {
                        this.swap(idx * 2, idx);
                        this.fix_down(idx * 2);
                    }
                } else if (this.nodes[idx * 2 + 1].priority < this.nodes[idx].priority) {
                    this.swap(idx * 2 + 1, idx);
                    this.fix_down(idx * 2 + 1);
                }
            } else if (this.nodes[idx * 2].priority < this.nodes[idx].priority) {
                this.swap(idx * 2, idx);
            }
        }
    }
    swap(first, second) {
        let h = this.nodes[first];
        this.nodes[first] = this.nodes[second];
        this.nodes[second] = h;
    }
    pop() {
        let val = this.nodes[1];
        if (this.size > 1) {
            this.nodes[1] = this.nodes[this.size];
            delete this.nodes[this.size--];
            this.fix_down(1);
        } else {
            delete this.nodes[this.size--];
        }
        return val;
    }
    empty() {
        return this.size == 0;
    }
}


class AStarPathFinder {
    constructor(unit, map, target, limit=AStarPathFinder.MAX_ITERATIONS) {
        this.unit = unit;
        this.map = map;
        this.visited = {};
        this.target = target;
        this.targetCenter = target;
        this.queue = new HeapQueue();
        this.queue.push({
            x: unit.subtile_x,
            y: unit.subtile_y,
            priority: 0
        });
        this.iterations = 0;
        this.limit = Math.min(limit, AStarPathFinder.MAX_ITERATIONS);
        this.done = false;

        this.rings = new Array(AStarPathFinder.RINGS_COUNT).fill(0);
        this.smallest_ring = AStarPathFinder.RINGS_COUNT;

        this.setCost(unit.subtile_x, unit.subtile_y, { from_x: null, from_y: null, cost: 0 });
    }
    isTarget(subtile) {
        return subtile.x == this.target.x && subtile.y == this.target.y;
    }
    run() {
        this.done = false;
        let nearest = {
            x: null, y: null, dist: Infinity
        };
        while (!this.queue.empty() && !this.done && this.iterations < this.limit) {
            ++this.iterations;
            var subtile = this.queue.pop();

            this.checkRings(subtile);

            if (this.isTarget(subtile)) {
                this.done = true;
            } else for (let i = 0, delta; delta = AStarPathFinder.NEIGHBOURS_DELTA[i]; ++i) {
                let nx = subtile.x + delta.x, ny = subtile.y + delta.y;
                let new_cost = this.currentCost(subtile.x, subtile.y) + this.neighbourCost(i);

                if (this.currentCost(nx, ny) > new_cost && this.checkSubtiles(nx, ny)) {
                    let dist = this.heuristic(nx, ny);
                    if (dist < nearest.dist) nearest = {
                        x: nx,
                        y: ny,
                        dist: dist
                    };
                    if (this.currentCost(nx, ny) == Infinity) this.queue.push({
                        x: nx,
                        y: ny,
                        priority: this.neighbourCost(i) + dist
                    });
                    this.setCost(nx, ny, {
                        from_x: subtile.x,
                        from_y: subtile.y,
                        cost: new_cost
                    });
                }
            }
        }

        if (!this.done && nearest.dist == Infinity) return null;

        let path, step, begin = this.done ? subtile : nearest;
        path = [{ x: begin.x, y: begin.y }];
        step = this.getStep(begin.x, begin.y);

        if (step.from_x === null && step.from_y === null) return [];

        while (step.from_x !== this.unit.subtile_x || step.from_y !== this.unit.subtile_y) {
            path.push({
                x: step.from_x,
                y: step.from_y
            });
            step = this.getStep(step.from_x, step.from_y);
        }
        path.push({
            x: step.from_x,
            y: step.from_y
        });
        return path.reverse();
    }
    neighbourCost(index) {
        return index % 2 == 0 ? 1 : Math.SQRT2;
    }
    getStep(x, y) {
        return this.visited[(x << 16) | y];
    }
    currentCost(x, y) {
        if (this.visited[(x << 16) | y] != null) {
            return this.visited[(x << 16) | y].cost;
        } else {
            return Infinity
        }
    }
    heuristic(x, y) {
        return (
            Math.abs(x - this.target.x) +
            Math.abs(y - this.target.y)
        );
    }
    setCost(x, y, data) {
        this.visited[(x << 16) | y] = data;
    }
    checkRings(subtile) {
        // in many cases target is unreachable because it's blocked from every side
        // by another objects therefore every time we enter a subtile which distance
        // from target is D (lower than RINGS_COUNT) we mark ring entrance.
        // If a ring was entered N times (N is circumference) it means that we checked
        // every subtile around it therefore the minimal number remaining subtiles to 
        // check can be limited by number of subtiles inside the ring because path
        // to target must be inside the ring
        let ring = 2 * (Math.max(Math.abs(subtile.x - this.targetCenter.x), Math.abs(subtile.y - this.targetCenter.y)) - 0.5);
        if (ring < AStarPathFinder.RINGS_COUNT) {
            ++this.rings[ring];
            if (this.rings[ring] == ring * 4 + 4 && ring < this.smallest_ring) {
                this.smallest_ring = ring;
                this.limit = this.iterations + ring * ring;
            }
        }
    }
    checkSubtiles(subtile_x, subtile_y) {
        if (
            subtile_x < 0 || subtile_x > this.map.edge_size * 2 - 1 ||
            subtile_y < 0 || subtile_y > this.map.edge_size * 2 - 1
        ) return false;

        for (let x = subtile_x & -2; x < subtile_x + this.unit.SUBTILE_WIDTH; x += 2) {
            for (let y = subtile_y & -2; y < subtile_y + this.unit.SUBTILE_WIDTH; y += 2) {
                if (!this.unit.SUPPORTED_TERRAIN.has(this.map.initial_tiles[Math.floor(x / 2)][Math.floor(y / 2)])) return false;
            }
        }
        for (let x = subtile_x; x < subtile_x + this.unit.SUBTILE_WIDTH; ++x) {
            for (let y = subtile_y; y < subtile_y + this.unit.SUBTILE_WIDTH; ++y) {
                if (this.map.subtiles[x][y] != null && this.map.subtiles[x][y] != this.unit) return false;
            }
        }
        return true;
    }
}
AStarPathFinder.NEIGHBOURS_DELTA = [
    { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
    { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }
];
AStarPathFinder.MAX_ITERATIONS = 128 * 128;
AStarPathFinder.RINGS_COUNT = 30;


// works exactly as AStarPathFinder but it treats every subtile around
// chosen entity as a valid target therefore avoids needless computations
class AStarToEntity extends AStarPathFinder {
    constructor(unit, map, target, distance=0, limit=AStarPathFinder.MAX_ITERATIONS) {
        super(unit, map, target, limit);
        this.distance = distance;
        this.targetCenter = target.getCenterSubtile();
        this.targetCenter = {
            x: this.targetCenter.subtile_x,
            y: this.targetCenter.subtile_y
        };
    }
    isTarget(subtile) {
        return Math.max(
            Math.abs(subtile.x + this.unit.SUBTILE_WIDTH / 2 - .5 - this.targetCenter.x),
            Math.abs(subtile.y + this.unit.SUBTILE_WIDTH / 2 - .5 - this.targetCenter.y)
        ) <= 0.01 + (this.unit.SUBTILE_WIDTH + this.target.SUBTILE_WIDTH) / 2 + this.distance;
    }
    heuristic(x, y) {
        return Math.max(
            Math.abs(x + this.unit.SUBTILE_WIDTH / 2 - .5 - this.targetCenter.x),
            Math.abs(y + this.unit.SUBTILE_WIDTH / 2 - .5 - this.targetCenter.y)
        );
    }
}


class UnitPathFinder {
    constructor(unit, map, target) {
        this.unit = unit;
        this.map = map;
        this.visited = new Array(this.map.subtiles.length).fill(null).map(() => new Array(this.map.subtiles.length).fill(null));
        this.target = target;
        this.queue = new StandardQueue();
        this.queue.push({
            x: target.x,
            y: target.y
        });
        this.setVisited(target.x, target.y, { from_x: null, from_y: null });
    }
    run() {
        let done = false;
        while (!this.queue.empty() && !done) {
            var subtile = this.queue.pop();
            if (subtile.x == this.unit.subtile_x && subtile.y == this.unit.subtile_y) {
                done = true;
            } else for (let delta of UnitPathFinder.NEIGHBOURS_DELTA) {
                let nx = subtile.x + delta.x, ny = subtile.y + delta.y;
                if (this.checkSubtiles(nx, ny) && !this.isVisited(nx, ny)) {
                    this.queue.push({
                        x: nx,
                        y: ny
                    });
                    this.setVisited(nx, ny, {
                        from_x: subtile.x,
                        from_y: subtile.y
                    });
                }
            }
        }
        let path = [], step = this.visited[subtile.x][subtile.y];
        while (step.from_x !== null) {
            path.push({
                x: step.from_x,
                y: step.from_y
            });
            step = this.visited[step.from_x][step.from_y];
        }
        return path;
    }
    checkSubtiles(subtile_x, subtile_y) {
        for (let x = subtile_x; x < subtile_x + this.unit.SUBTILE_WIDTH; ++x)
            for (let y = subtile_y; y < subtile_y + this.unit.SUBTILE_WIDTH; ++y)
                if (this.map.subtiles[x][y] != null && this.map.subtiles[x][y] != this.unit) return false;
        return true;
    }
    isVisited(x, y) {
        return this.visited[x][y] !== null;
    }
    setVisited(x, y, data) {
        this.visited[x][y] = data || true;
    }
}
UnitPathFinder.NEIGHBOURS_DELTA = [
    { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
    { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }
];


export {
    BFSWalker, UnitPathFinder, MultiSlotQueue, StandardQueue,
    AStarPathFinder, AStarToEntity
}
