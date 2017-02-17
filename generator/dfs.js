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
