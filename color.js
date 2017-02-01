function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.toFillStyle = () => "rgb(" + r + ", " + g + ", " + b + ")";    
}

function ColorRandomizer(delta) {
    var ca = new Uint8ClampedArray(3);
    this.delta = delta;
    this.randomize = (col) => {
        ca[0] = col.r + randInt(delta * 2) - delta;
        ca[1] = col.g + randInt(delta * 2) - delta;
        ca[2] = col.b + randInt(delta * 2) - delta;
        return new Color(...ca);
    };
}
