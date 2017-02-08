function ByteArray(w, h) {
    this.checkRange = (x, y) => !(x < 0 || x >= w || y < 0 || y >= h);
    this.array = new Uint8Array(w * h);
    this.get = (x, y) => this.array[y * w + x];
    this.set = (x, y, b) => this.array[y * w + x] = b;
    this.addMask = (x, y, mask) => this.array[y * w + x] |= mask;
    this.subtractMask = (x, y, mask) => this.array[y * w + x] &= ~mask;
    this.testMask = (x, y, mask) => (this.array[y * w + x] & mask) !== 0;
    this.getWidth = () => w;
    this.getHeight = () => h;
}

const PATH_MASK = 1 << 6;

