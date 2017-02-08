function Maze(w, h) {
    this.ar = new ByteArray(w, h);
    function assertRange(x, y) {
        if (!this.ar.checkRange(x, y))
            throw "Invalid range " + x + " " + y + ".";
    }

    assertRange = assertRange.bind(this);

    this.makePass = (pos, direction) => {
        var to = direction.step(pos);
        assertRange(pos.x, pos.y);
        assertRange(to.x, to.y);
        this.ar.addMask(pos.x, pos.y, direction.mask);
        this.ar.addMask(to.x, to.y, direction.opposite.mask);
    };
    
    this.makeWall = (pos, direction) => {
        var to = direction.step(pos);
        assertRange(pos.x, pos.y);
        assertRange(to.x, to.y);
        this.ar.subtractMask(pos.x, pos.y, direction.mask);
        this.ar.subtractMask(to.x, to.y, direction.opposite.mask);
    };

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
        let nextLine = () => {
            cx = 0;
            cy++;
        };
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
                pushTile(this.ar.get(i, j) & PATH_MASK);
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

function Location(pos, from) {
    this.pos = pos;
    this.from = from;
}

function shuffledDirections() {
    var dirs = [...directions];
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

function DFSGenerator() {
    this.generate = (maze, rect) => {
        var stack = new Array();
        var visited = new VisitArray(rect);
        stack.push(new Location(rect, null));

        while (stack.length > 0) {
            let loc = stack.pop();
            let pos = loc.pos;
            let from = loc.from;
            if (visited.isVisited(pos))
                continue;
            visited.visit(pos);
            if (from)
                maze.makePass(pos, from);
            var dirs = shuffledDirections();            
            dirs.forEach(dir => {
                let nPos = dir.step(pos);
                if (!rect.inside(nPos) || visited.isVisited(nPos))
                    return;
                stack.push(new Location(nPos, dir.opposite));
            });
        }
    };
}

function MSTGenerator() {

    this.generate = (maze, rect) => {
        var queue = new Array();
        var visited = new VisitArray(rect);
        queue.push(new Location(rect, null));

        while (queue.length > 0) {
            let idx = randInt(queue.length);
            let temp = queue[idx];
            queue[idx] = queue[queue.length - 1];
            queue[queue.length - 1] = temp;

            let loc = queue.pop();
            let pos = loc.pos;
            let from = loc.from;

            if (visited.isVisited(pos))
                continue;

            visited.visit(pos);

            if (from)
                maze.makePass(pos, from);

            var dirs = shuffledDirections();

            dirs.forEach(dir => {
                let nPos = dir.step(pos);
                if (!rect.inside(nPos) || visited.isVisited(nPos))
                    return;
                queue.push(new Location(nPos, dir.opposite));
            });
        }
        return maze;
    };
}

function RSGenerator() {

    this.generate = (maze, rect) => {
        for (let i = 0; i < rect.w; i++)
            for (let j = 0; j < rect.h; j++) {
                if (i < rect.w - 1) maze.makePass(new Pos(i + rect.x, j + rect.y), RIGHT);
                if (j < rect.h - 1) maze.makePass(new Pos(i + rect.x, j + rect.y), DOWN);
            }
        
        function subdivide(x, y, w, h) {
            if (w > h) {
                if (w < 2)
                    return;
                let passY = randInt(h);
                let wallX = w >> 1;
                for (let i = 0; i < h; i++) {
                    if (i === passY)
                        continue;
                    maze.makeWall(new Pos(x + wallX, y + i), LEFT);
                }
                subdivide(x, y, wallX, h);
                subdivide(x + wallX, y, w - wallX, h);
            } else {
                if (h < 2)
                    return;
                let passX = randInt(w);
                let wallY = h >> 1;
                for (let i = 0; i < w; i++) {
                    if (i === passX)
                        continue;
                    maze.makeWall(new Pos(x + i, y + wallY), UP);
                }
                subdivide(x, y, w, wallY);
                subdivide(x, y + wallY, w, h - wallY);
            }
        }
        
        subdivide(rect.x, rect.y, rect.w, rect.h);
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

function Solver(start, end) {
    this.solve = (maze) => {
        let w = maze.ar.getWidth(), h = maze.ar.getHeight();
        let parents = new Map();

        for (let i = 0; i < w; i++)
            for (let j = 0; j < h; j++) {
                maze.ar.subtractMask(i, j, PATH_MASK);
                maze.ar.subtractMask(i, j, VISITED_MASK);
            }

        var queue = new Array();
        queue.push(new Location(start, null));

        while (queue.length > 0) {
            let loc = queue.shift();
            let x = loc.pos.x;
            let y = loc.pos.y;
            let from = loc.from;
            if (loc.pos.samePos(end)) {
                let path = [];
                let cp = end;
                while (!cp.samePos(start)) {
                    maze.ar.addMask(cp.x, cp.y, PATH_MASK);
                    path.push(cp);
                    cp = parents.get(cp.toStringKey());
                }
                path.push(start);
                maze.ar.addMask(start.x, start.y, PATH_MASK);
                return path.reverse();
            }
            directions.forEach(dir => {
                let nx = x + dir.dx;
                let ny = y + dir.dy;
                if (!maze.isInside(nx, ny) || maze.isVisited(nx, ny) || !maze.ar.testMask(x, y, dir.mask))
                    return;
                let npos = new Pos(nx, ny);
                parents.set(npos.toStringKey(), loc.pos);
                maze.visit(nx, ny);
                queue.push(new Location(new Pos(nx, ny), dir.opposite));
            });
        }
        return [];
    };
}
