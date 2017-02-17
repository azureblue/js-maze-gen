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
