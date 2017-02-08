function SimpleRenderer(wCol, pCol, sCol, wSize, pSize) {
    const cs = wSize + pSize;
    var tileRect = (pos) => {
        return new Rect(wSize + (pos.x * cs), wSize + (pos.y * cs), pSize, pSize);
    };
    
    this.getBounds = (maze) => {
        let pw = maze.toPassageWallRepresentation();
        return {
            w: (pw.getWidth() >> 1) * (pSize + wSize) + wSize,
            h: (pw.getHeight() >> 1) * (pSize + wSize) + wSize
        };
    };

    this.renderPath = (ctx, path) => {
        if (path.length === 0)
            return;
        
        ctx.fillStyle = sCol.toFillStyle();
        let start = tileRect(path[0]);
        ctx.fillRect(start.x, start.y, start.w, start.h);
        for (let i = 1; i < path.length; i++) {
            let current = tileRect(path[i]);
            let minX = Math.min(start.x, current.x);
            let minY = Math.min(start.y, current.y);
            ctx.fillRect(minX, minY,
                Math.max(start.x + start.w, current.x + current.w) - minX,
                Math.max(start.y + start.h, current.y + current.h) - minY);
            start = current;
        }
    };
    this.render = (ctx, maze) => {
        let pw = maze.toPassageWallRepresentation();
        let w = pw.getWidth(), h = pw.getHeight();

        for (let j = 0; j < h; j++)
            for (let i = 0; i < w; i++) {
                let cw = (i & 1) ? pSize : wSize;
                let ch = (j & 1) ? pSize : wSize;
                let px = (i & 1) ? wSize : 0;
                let py = (j & 1) ? wSize : 0;
                let col = pw.testMask(i, j, 1) ? wCol : pCol;
                ctx.fillStyle = col.toFillStyle();
                ctx.fillRect((i >> 1) * cs + px, (j >> 1) * cs + py, cw, ch);
            }
        ctx.fillStyle = pCol.toFillStyle();
        ctx.fillRect(wSize, 0, pSize, wSize);
        ctx.fillRect(((w - 2) >> 1) * cs + wSize, ((h - 1) >> 1) * cs, pSize, wSize);

        for (let j = 2; j < h - 1; j += 2)
            for (let i = 2; i < w - 1; i += 2) {
                let flag = false;
                for (let k = -1; k < 2; k++)
                    for (let l = -1; l < 2; l++) {
                        if (k === 0 && l === 0)
                            continue;
                        if (pw.testMask(i + k, j + l, 1))
                            flag = true;
                    }

                if (!flag) {
                    ctx.fillStyle = pCol.toFillStyle();
                    ctx.fillRect((i >> 1) * cs, (j >> 1) * cs, wSize, wSize);
                }
            }
    };
}
