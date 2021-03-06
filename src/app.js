import { Sprites } from './sprites.js';
import './graphics/graphics.js';
import { MenuNavigator } from './navigator.js';

class Game {
    constructor(container) {
        this.stage_width = Game.STAGE_WIDTH;
        this.stage_height = Game.STAGE_HEIGHT;


        this.stage = new Graphics.Stage({
            container: container,
            width: this.stage_width,
            height: this.stage_height
        });

        this.layers = {
            terrain: new Graphics.HitlessLayer(),
            entities: new Graphics.Layer(),
            // grid: new Graphics.GridPreview(this.stage),
            interface: new Graphics.Layer()
        };

        this.stage.add(this.layers.terrain);
        this.stage.add(this.layers.entities);
        // this.stage.add(this.layers.grid);
        this.stage.add(this.layers.interface);

        this.navigator = new MenuNavigator(this.stage, this.layers);
    }
    draw() {
        this.stage.draw();
    }
}
Game.STAGE_WIDTH = 800;
Game.STAGE_HEIGHT = 600;

document.oncontextmenu = function() { return false; };

Sprites.ready.then(function() {
    let game = new Game('container');
    game.draw();
})

