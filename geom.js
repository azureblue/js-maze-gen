function Pos(x, y) {
    this.x = x;
    this.y = y;
    Object.freeze(this);
}

Pos.prototype.toStringKey = function() {return "pos:" + this.x + ":" + this.y;};
Pos.prototype.samePos = function(pos) {return pos.x === this.x && pos.y === this.y;};

function Rect(x, y, width, height) {
    this.w = width;
    this.h = height;
    Pos.call(this, x, y);
}

Rect.prototype = Object.create(Pos.prototype);
Rect.prototype.inside = function(pos) { 
    return this.insideXY(pos.x, pos.y); 
};

Rect.prototype.insideXY = function(x, y) { 
    return x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h;
};

Rect.prototype.toStringKey = function() { return "rect:" + this.x + ":" + this.y + ":" + this.w + ":" + this.h; };
