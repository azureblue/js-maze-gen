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
    this.ar = new ByteArray(w, h);
    function assertRange(x, y) {
        if (!this.ar.checkRange(x, y))
            throw "Invalid range " + x + " " + y + ".";
    }
    
    assertRange = assertRange.bind(this);

    this.makePass = (x, y, direction) => {
        var toX = x + direction.dx;
        var toY = y + direction.dy;
        assertRange(x, y);
        assertRange(toX, toY);
        this.ar.addMask(x, y, direction.mask);
        this.ar.addMask(toX, toY, direction.opposite.mask);
    };
    
    this.isVisited = (x, y) => this.ar.testMask(x, y, VISITED_MASK);
    this.visit = (x, y) => this.ar.addMask(x, y, VISITED_MASK);
    this.isInside = (x, y) => this.ar.checkRange(x, y);
    
    this.printToConsole = () => {
        let pw = this.toPassageWallRepresentation();
        let w = pw.getWidth(), h = pw.getHeight();
        let str = [];
         for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++)
                str.push(pw.testMask(i, j, 1) ? "#" : " ");
            str.push("\n");
        }
        console.log(str.join(""));
    };
    
    this.toPassageWallRepresentation = () => {
        let pw = new ByteArray(this.ar.getWidth() * 2 + 1, this.ar.getHeight() * 2 + 1);
        let cx = 0, cy = 0;
        let pushTile = (val) => pw.set(cx++, cy, val);
        let nextLine = () => {cx = 0; cy++;};
        let w = this.ar.getWidth(), h = this.ar.getHeight();
        for (let i = 0; i < w; i++) {
            pushTile(1);
            pushTile(1);
        }
        pushTile(1);
        nextLine();
        for (let j = 0; j < h; j++) {
            pushTile(1);
            for (let i = 0; i < w; i++) {
                pushTile(0);
                if (this.ar.testMask(i, j, RIGHT.mask))
                    pushTile(0);
                else
                    pushTile(1);
            }
            nextLine();
            pushTile(1);
            for (let i = 0; i < w; i++) {
                if (this.ar.testMask(i, j, DOWN.mask))
                    pushTile(0);
                else
                    pushTile(1);
                pushTile(1);
            }
            nextLine();
        }
        return pw;
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
        res.push(dirs.splice(randInt(dirs.length), 1)[0]);
    return res;
}

function DFSGenerator() {
    function Location(pos, from) {
        this.pos = pos;
        this.from = from;
    }
    this.generate = (w, h) => {
        var maze = new Maze(w, h);
        var stack = new Array();
        stack.push(new Location(new Pos(0, 0), null));

        while (stack.length > 0) {
            let loc = stack.pop();
            let x = loc.pos.x;
            let y = loc.pos.y;
            let from = loc.from;

            if (maze.isVisited(x, y))
                continue;

            maze.visit(x, y);

            if (from !== null)
                maze.makePass(x, y, from);

            var dirs = shuffledDirections();
            
            dirs.forEach(dir => {                
                let nx = x + dir.dx;
                let ny = y + dir.dy;
                if (!maze.isInside(nx, ny) || maze.isVisited(nx, ny))
                    return;
                stack.push(new Location(new Pos(nx, ny), dir.opposite));
            });
        }
        return maze;
    };
}

function MSTGenerator() {
    function Location(pos, from) {
        this.pos = pos;
        this.from = from;
    }
    this.generate = (w, h) => {
        var maze = new Maze(w, h);
        var queue = new Array();
        queue.push(new Location(new Pos(0, 0), null));

        while (queue.length > 0) {
            let idx = randInt(queue.length);
            let temp = queue[idx];
            queue[idx] = queue[queue.length - 1];
            queue[queue.length - 1] = temp;
            
            let loc = queue.pop();
            let x = loc.pos.x;
            let y = loc.pos.y;
            let from = loc.from;

            if (maze.isVisited(x, y))
                continue;

            maze.visit(x, y);

            if (from !== null)
                maze.makePass(x, y, from);

            var dirs = shuffledDirections();
            
            dirs.forEach(dir => {                
                let nx = x + dir.dx;
                let ny = y + dir.dy;
                if (!maze.isInside(nx, ny) || maze.isVisited(nx, ny))
                    return;
                queue.push(new Location(new Pos(nx, ny), dir.opposite));
            });
        }
        return maze;
    };
}

function WallRemover() {
    
    this.removeWalls = (maze, n) => {
        let w = maze.ar.getWidth(), h = maze.ar.getHeight();
        let mt = 100000;
        for (let i = 0; i < n; i++) {
            let x = randInt(w);
            let y = randInt(h);
            let dir = directions[randInt(directions.length)];
            let nx = x + dir.dx;
            let ny = y + dir.dy;
            if (!maze.isInside(nx, ny)) {
                i--;
                continue;
            }
            if (maze.ar.testMask(x, y, dir.mask)) {
                if (mt > 0) {
                    mt--;
                    i--;
                    continue;
                }
                continue;
            }
            maze.makePass(x, y, dir);
        }
    };
}
