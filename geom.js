function Pos(x, y) {
    this.x = x;
    this.y = y;
    Object.freeze(this);
}

Pos.prototype.toStringKey = function() {return "pos:" + this.x + ":" + this.y;};
Pos.prototype.samePos = function(pos) {return pos.x === this.x && pos.y === this.y;};

function Rect(x, y, width, height) {
    this.w = width;
    this.h = height;
    Pos.call(this, x, y);
}

Rect.prototype = Object.create(Pos.prototype);
Rect.prototype.inside = function(pos) { 
    return this.insideXY(pos.x, pos.y); 
};

Rect.prototype.insideXY = function(x, y) { 
    return x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h;
};

Rect.prototype.toStringKey = function() { return "rect:" + this.x + ":" + this.y + ":" + this.w + ":" + this.h; };


function Direction(dx, dy, mask) {
    this.dx = dx;
    this.dy = dy;
    this.mask = mask;
    this.opposite;
}

Direction.prototype.step = function(pos) { return new Pos(pos.x + this.dx, pos.y + this.dy); };

const UP = new Direction(0, -1, 1);
const RIGHT = new Direction(1, 0, 1 << 1);
const DOWN = new Direction(0, 1, 1 << 4);
const LEFT = new Direction(-1, 0, 1 << 3);

UP.opposite = DOWN;
DOWN.opposite = UP;
RIGHT.opposite = LEFT;
LEFT.opposite = RIGHT;

Object.freeze(UP);
Object.freeze(DOWN);
Object.freeze(LEFT);
Object.freeze(RIGHT);

var directions = [UP, RIGHT, DOWN, LEFT];
Object.freeze(directions);
