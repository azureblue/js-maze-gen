function SimpleRenderer(wCol, pCol, wSize, pSize) {
    this.getBounds = (maze) => {
        let pw = maze.toPassageWallRepresentation();
        return {
            w: (pw.getWidth() >> 1) * (pSize + wSize) + wSize,
            h: (pw.getHeight() >> 1) * (pSize + wSize) + wSize
        }
    }
    this.render = (ctx, maze) => {
        let pw = maze.toPassageWallRepresentation();
        let w = pw.getWidth(), h = pw.getHeight();
        let cs = wSize + pSize;
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
    };
}
