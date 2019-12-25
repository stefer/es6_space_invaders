'use strict';

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(d) {
        return new Vector(this.x + d.x, this.y + d.y)
    }

    subtract(d) {
        return new Vector(this.x - d.x, this.y - d.y)
    }
}

class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static fromcenter(v, width, height) {
        return new Rect(v.x-width/2, v.y-height/2, width, height);
    }

    shrink(dx, dy, dw, dh) {
        return new Rect(this.x+dx, this.y-dy, this.width-dw, this.height-dh);
    }

    translate(v) {
        return new Rect(this.x+v.x, this.y+v.y, this.width, this.height);
    }

    local() {
        return new Rect(-this.width/2, -this.height/2, this.width, this.height)
    }

    pointinside(v)
    {
        return (v.x >= this.x && v.x <= this.x+this.width)
            && (v.y >= this.y && v.y <= this.y+this.height)
    }

    corners() {
        return [
            new Vector(this.x, this.y),
            new Vector(this.x, this.y + this.height),
            new Vector(this.x + this.width, this.y + this.height),
            new Vector(this.x + this.width, this.y),
        ]
    }

    rectinside(r) {
        return r.corners().every(rv => this.pointinside(rv));
    }

    overlaps(r) {
        return r.corners().some(rv => this.pointinside(rv));
    }

    toinside(v)
    {
        var x = v.x;
        var y = v.y;

        x = Math.max(this.x, x);
        x = Math.min(x, this.x+this.width);
        y = Math.max(this.y, y);
        y = Math.min(y, this.y+this.height);

        return new Vector(x, y);
    }
}