class PlayerDefinition {
    constructor(index, name, civ, colour, team=null, is_cpu=true) {
        this.index = index;
        this.name = name;
        if (civ === null) {
            this.civ = Math.floor(Math.random() * CIVILIZATIONS.length);
        } else {
            this.civ = civ;
        }
        this.colour = colour;
        this.team = team;
        this.is_cpu = is_cpu;
    }
}

let PLAYER_COLOURS = [
    "blue",
    "red",
    "yellow",
    "brown",
    "orange",
    "green",
    "gray",
    "navy"
];

let CIVILIZATIONS = {
    EGYPTIAN: {
        index: 0,
        name: "Egyptian"
    },
    BABYLONIAN: {
        index: 1,
        name: "Babylonian"
    },
    GREEK: {
        index: 2,
        name: "Greek"
    },
    ASIATIC: {
        index: 3,
        name: "Asiatic"
    },
    0: "Egyptian",
    1: "Babylonian",
    2: "Greek",
    3: "Asiatic",
    length: 4
}
let CIVILIZATIONS_NAMES = [
    "Egyptian",
    "Babylonian",
    "Greek",
    "Asiatic"
]


var make_image = function(src) {
    let img = new Image;
    img.src = src;
    return img;
}

var to_binary = function(num) {
    let bin = (+num).toString(2);
    return "00000000".substr(bin.length) + bin;
}

var leftpad = function(val, width, pad) {
    let str = val.toString();
    return Array(width + 1).join(pad).substr(str.length) + val;
}

var rand_choice = function(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
}

var rect_intersection = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(
        x1 + w1 < x2 || x1 > x2 + w2 ||
        y1 + h1 < y2 || y1 > y2 + h2
    );
}

export {
    PlayerDefinition, PLAYER_COLOURS, CIVILIZATIONS, CIVILIZATIONS_NAMES,
    make_image, to_binary, leftpad, rand_choice, rect_intersection
}