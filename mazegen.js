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

function DFSGenerator() {
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
    this.generate = (maze, rect) => {
        var queue = new Array();
        queue.push(new Location(new Pos(randInt(w), randInt(h)), null));

        while (queue.length > 0) {
            moveToEnd(randInt(queue.length));
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

function RSGenerator() {
    this.generate = (maze, rect) => {
        for (let i = 0; i < rect.w; i++)
            for (let j = 0; j < rect.h; j++) {
                if (i < rect.w - 1) maze.makePass(new Pos(i + rect.x, j + rect.y), Direction.RIGHT);
                if (j < rect.h - 1) maze.makePass(new Pos(i + rect.x, j + rect.y), Direction.DOWN);
            }
        subdivide(maze, rect.x, rect.y, rect.w, rect.h);
    };
    
    function subdivide(maze, x, y, w, h) {
            if (w > h) {
                if (w < 2)
                    return;
                let passY = randInt(h);
                let wallX = w >> 1;
                for (let i = 0; i < h; i++) {
                    if (i === passY)
                        continue;
                    maze.makeWall(new Pos(x + wallX, y + i), Direction.LEFT);
                }
                subdivide(maze, x, y, wallX, h);
                subdivide(maze, x + wallX, y, w - wallX, h);
            } else {
                if (h < 2)
                    return;
                let passX = randInt(w);
                let wallY = h >> 1;
                for (let i = 0; i < w; i++) {
                    if (i === passX)
                        continue;
                    maze.makeWall(new Pos(x + i, y + wallY), Direction.UP);
                }
                subdivide(maze, x, y, w, wallY);
                subdivide(maze, x, y + wallY, w, h - wallY);
            }
        }
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
