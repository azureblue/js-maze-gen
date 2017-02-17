function MSTGenerator() {
    this.generate = (maze, rect) => {
        var queue = new Array();
        var visited = new VisitArray(rect);
        queue.push(new Location(rect, null));

        while (queue.length > 0) {
            moveToEnd(queue, randInt(queue.length));
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
