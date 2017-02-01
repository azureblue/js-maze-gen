function ByteArray(w, h) {
    this.checkRange = (x, y) => !(x < 0 || x >= w || y < 0 || y >= h);
    this.array = new Uint8Array(w * h);
    this.get = (x, y) => this.array[y * w + x];
    this.set = (x, y, b) => this.array[y * w + x] = b;
    this.addMask = (x, y, mask) => this.array[y * w + x] |= mask;
    this.testMask = (x, y, mask) => (this.array[y * w + x] & mask) !== 0;
}


function makeReadOnly(obj, prop) {
    Object.defineProperty(obj, prop, {writable: false, configurable: false});
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

function Maze(w, h) {
    ByteArray.call(this, w, h);
    function assertRange(x, y) {
        if (!this.checkRange(x, y))
            throw "Invalid range " + x + " " + y + ".";
    }
    assertRange = assertRange.bind(this);

    this.makePass = (x, y, direction) => {
        assertRange(x, y);
        var toX = x + direction.dx;
        var toY = y + direction.dy;
        assertRange(toX, toY);
        this.addMask(x, y, direction.mask);
        this.addMask(toX, toY, direction.opposite.mask);
    };

    this.printToConsole = () => {
        var res = [];
        for (let i = 0; i < w; i++)
            res.push("##");
        res.push("#\n");
        for (let j = 0; j < h; j++) {
            res.push("#");
            for (let i = 0; i < w; i++) {
                res.push(" ");
                if (this.testMask(i, j, RIGHT.mask))
                    res.push(" ");
                else
                    res.push("#");
            }
            res.push("\n");
            res.push("#");
            for (let i = 0; i < w; i++) {
                if (this.testMask(i, j, DOWN.mask))
                    res.push(" ");
                else
                    res.push("#");
                res.push("#");
            }

            res.push("\n");
        }
        console.log(res.join(""));
    };
}

function Pos(x, y) {
    this.x = x;
    this.y = y;
    Object.freeze(this);
}

function shuffledDirections() {
    var dirs = [...directions];
    var res = [];
    while (dirs.length > 0)
        res.push(dirs.splice(Math.floor(Math.random() * dirs.length), 1)[0]);
    return res;
}

function Generator() {
    function Location(pos, from) {
        this.pos = pos;
        this.from = from;
    }
    this.generateDFS = (w, h) => {
        var maze = new Maze(w, h);
        var stack = new Array();
        stack.push(new Location(new Pos(0, 0), null));

        while (stack.length > 0) {
            let loc = stack.pop();
            let x = loc.pos.x;
            let y = loc.pos.y;
            let from = loc.from;

            if (maze.testMask(x, y, VISITED_MASK))
                continue;

            maze.addMask(x, y, VISITED_MASK);

            if (from !== null)
                maze.makePass(x, y, from);

            var dirs = shuffledDirections();
            
            dirs.forEach(dir => {                
                let nx = x + dir.dx;
                let ny = y + dir.dy;
                if ((!maze.checkRange(nx, ny)) || maze.testMask(nx, ny, VISITED_MASK))
                    return;
                stack.push(new Location(new Pos(nx, ny), dir.opposite));
            });
        }
        return maze;
    };
}

