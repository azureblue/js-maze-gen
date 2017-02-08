function ByteArray(w, h) {
    var rect = new Rect(0, 0, w, h);
    var assertRange = (x, y) => {
        if (!rect.insideXY(x, y))
            throw "Out of range: (" + x + ", " + y + ").";
    };
    this.checkRange = (x, y) => rect.insideXY(x, y);
    this.array = new Uint8Array(w * h);
    this.get = (x, y) => (assertRange(x, y), this.array[y * w + x]);
    this.set = (x, y, b) => (assertRange(x, y), this.array[y * w + x] = b);
    this.addMask = (x, y, mask) => (assertRange(x, y), this.array[y * w + x] |= mask);
    this.subtractMask = (x, y, mask) => (assertRange(x, y), this.array[y * w + x] &= ~mask);
    this.testMask = (x, y, mask) => (assertRange(x, y), (this.array[y * w + x] & mask) !== 0);
    this.getWidth = () => w;
    this.getHeight = () => h;
}
