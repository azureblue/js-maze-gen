function ByteArray(w, h) {
    this.checkRange = (x, y) => !(x < 0 || x >= w || y < 0 || y >= h);
    this.array = new Uint8Array(w * h);
    this.get = (x, y) => this.array[y * w + x];
    this.set = (x, y, b) => this.array[y * w + x] = b;
    this.addMask = (x, y, mask) => this.array[y * w + x] |= mask;
    this.subtractMask = (x, y, mask) => this.array[y * w + x] &= ~mask;
    this.testMask = (x, y, mask) => (this.array[y * w + x] & mask) !== 0;
    this.getWidth = () => w;
    this.getHeight = () => h;
}

function Direction(dx, dy, mask) {
    this.dx = dx;
    this.dy = dy;
    this.mask = mask;
    this.opposite;
}

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

const VISITED_MASK = 1 << 5;
const PATH_MASK = 1 << 6;

