
function ByteArray(w, h) {
    this.checkRange = (x, y) => !(x < 0 || x >= w || y < 0 || y >= h);
    this.array = new Uint8Array(w * h);
    this.get = (x, y) => this.array[y * w + x];
    this.set = (x, y, b) => this.array[y * w + x] = b;
    this.addMask = (x, y, mask) => this.array[y * w + x] |= mask;
    this.testMask = (x, y, mask) => (this.array[y * w + x] & mask) !== 0;
}

function Direction(dx, dy, mask) {
    this.dx = () => dx;
    this.dy = () => dy;
    this.mask = () => mask;
    this.opposite;
}

var UP = new Direction(0, -1, 1);
var RIGHT = new Direction(1, 0, 1 << 1);
var DOWN = new Direction(0, 1, 1 << 4);
var LEFT = new Direction(-1, 0, 1 << 3);
UP.opposite = DOWN;
DOWN.opposite = UP;
RIGHT.opposite = LEFT;
LEFT.opposite = RIGHT;

var directions = [UP, RIGHT, DOWN, LEFT];

var VISITED_MASK = 1 << 5;

function Maze(w, h) {
    ByteArray.call(this, w, h);
    function assertRange(x, y) {
        if (x < 0 || x >= w || y < 0 || y >= h)
            throw "Invalid range " + x + " " + y + ".";
    }
    this.makePass = (x, y, direction) => {
        assertRange(x, y);
        var toX = x + direction.dx();
        var toY = y + direction.dy();
        assertRange(toX, toY);
        this.addMask(x, y, direction.mask());
        this.addMask(toX, toY, direction.opposite.mask());
    };
    
    this.print = () => {
        var res = "";
        for (let i = 0; i < w; i++)
            res = res.concat("##");
        res = res.concat("#\n");
        for (let j = 0; j < h; j++) {
            res = res.concat("#");
            for (let i = 0; i < w; i++) {
                res = res.concat(" ");
                if ((this.get(i, j) & RIGHT.mask()) !== 0)
                    res = res.concat(" ");
                else
                    res = res.concat("#");
            }
            res = res.concat("\n");
            res = res.concat("#");
            for (let i = 0; i < w; i++) {
                if ((this.get(i, j) & DOWN.mask()) !== 0)
                    res = res.concat(" ");
                else
                    res = res.concat("#");
                res = res.concat("#");
            }
            
            res = res.concat("\n");
        }
        console.log(res);
    };
}

function Pos(x, y) {
    this.x = () => x;
    this.y = () => y;
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
        this.pos = () => pos;
        this.from = () => from;
    }
    this.generateDFS = (w, h) => {
        var maze = new Maze(w, h);
        var stack = new Array();
        stack.push(new Location(new Pos(0, 0), null));
        
        while (stack.length > 0) {
            var loc = stack.pop();
            var pos = loc.pos();
            var from = loc.from();
            
            if (maze.testMask(pos.x(), pos.y(), VISITED_MASK))
                continue;
            
            maze.addMask(pos.x(), pos.y(), VISITED_MASK);
            
            if (from !== null)
                maze.makePass(pos.x(), pos.y(), from);
            
            var dirs = shuffledDirections();
            dirs.forEach(dir => {
                var x = pos.x() + dir.dx();
                var y = pos.y() + dir.dy();
                
                if ((!maze.checkRange(x, y)) || maze.testMask(x, y, VISITED_MASK))
                    return;
                
                stack.push(new Location(new Pos(x, y), dir.opposite));
            });
        } 
        return maze;
    };
}

