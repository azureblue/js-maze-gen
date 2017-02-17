function Maze(w, h) {
    var ar = new ByteArray(w, h);

    this.makePass = (pos, direction) => {
        var to = direction.step(pos);
        ar.addMask(pos.x, pos.y, direction.mask);
        ar.addMask(to.x, to.y, direction.opposite.mask);
    };
    
    this.makeWall = (pos, direction) => {
        var to = direction.step(pos);
        ar.subtractMask(pos.x, pos.y, direction.mask);
        ar.subtractMask(to.x, to.y, direction.opposite.mask);
    };
    
    this.getWidth = () => ar.getWidth();
    this.getHeight = () => ar.getHeight();
    
    this.hasPass = (pos, direction) => ar.testMask(pos.x, pos.y, direction.mask);

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
        let pw = new ByteArray(ar.getWidth() * 2 + 1, ar.getHeight() * 2 + 1);
        let cx = 0, cy = 0;
        let pushTile = (val) => pw.set(cx++, cy, val);
        let nextLine = () => {
            cx = 0;
            cy++;
        };
        let w = ar.getWidth(), h = ar.getHeight();
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
                if (ar.testMask(i, j, Direction.RIGHT.mask))
                    pushTile(0);
                else
                    pushTile(1);
            }
            nextLine();
            pushTile(1);
            for (let i = 0; i < w; i++) {
                if (ar.testMask(i, j, Direction.DOWN.mask))
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

function Direction(dx, dy, mask) {
    this.dx = dx;
    this.dy = dy;
    this.mask = mask;
    this.opposite;
}

Direction.prototype.step = function(pos) { return new Pos(pos.x + this.dx, pos.y + this.dy); };

Direction.UP = new Direction(0, -1, 1);
Direction.RIGHT = new Direction(1, 0, 1 << 1);
Direction.DOWN = new Direction(0, 1, 1 << 2);
Direction.LEFT = new Direction(-1, 0, 1 << 3);

Direction.UP.opposite = Direction.DOWN;
Direction.DOWN.opposite = Direction.UP;
Direction.RIGHT.opposite = Direction.LEFT;
Direction.LEFT.opposite = Direction.RIGHT;

Direction.directions = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];
[...Direction.directions, Direction.directions, Direction].forEach(ob => Object.freeze(ob));

function Location(pos, from) {
    this.pos = pos;
    this.from = from;
}

function shuffledDirections() {
    var dirs = [...Direction.directions];
    var res = [];
    while (dirs.length > 0)
        res.push(dirs.splice(randInt(dirs.length), 1)[0]);
    return res;
}

function VisitArray(rect) {
    const VISITED_MASK = 1 << 5;
    var ar = new ByteArray(rect.w, rect.h);
    this.isVisited = (pos) => ar.testMask(pos.x - rect.x, pos.y - rect.y, VISITED_MASK);
    this.visit = (pos) => ar.addMask(pos.x - rect.x, pos.y - rect.y, VISITED_MASK);
}

function WallRemover() {
    this.removeWalls = (maze, n) => {
        let mRect = new Rect(0, 0, maze.getWidth(), maze.getHeight());
        let mt = 100000;
        for (let i = 0; i < n; i++) {
            let pos = new Pos(randInt(mRect.w), randInt(mRect.h));
            let dir = Direction.directions[randInt(Direction.directions.length)];
            let nPos = dir.step(pos);
            if (!mRect.inside(nPos)) {
                i--;
                continue;
            }
            if (maze.hasPass(pos, dir)) {
                if (mt > 0) {
                    mt--;
                    i--;
                    continue;
                }
                continue;
            }
            maze.makePass(pos, dir);
        }
    };
}

function Solver(start, end) {
    this.solve = (maze) => {
        let rect = new Rect(0, 0, maze.getWidth(), maze.getHeight());
        let parents = new Map();
        
        var visited = new VisitArray(rect);

        var queue = new Array();
        queue.push(start);

        while (queue.length > 0) {
            let pos = queue.shift();
            if (pos.samePos(end)) {
                let path = [];
                let cp = end;
                while (!cp.samePos(start)) {                    
                    path.push(cp);
                    cp = parents.get(cp.toStringKey());
                }
                path.push(start);                
                return path.reverse();
            }
            Direction.directions.forEach(dir => {
                let nPos = dir.step(pos);
                if (!rect.inside(nPos) || visited.isVisited(nPos) || !maze.hasPass(pos, dir))
                    return;
                parents.set(nPos.toStringKey(), pos);
                visited.visit(nPos);
                queue.push(nPos);
            });
        }
        return [];
    };
}
