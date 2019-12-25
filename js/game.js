'use strict';

class Game {
    constructor(ctx) {
        this.speed = 5;
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.bounds = new Rect(0, 0, this.width, this.height);

        this.defender = new Defender(new Vector(this.width/2, this.height-10));
        this.missiles = [];
    }

    onkeydown(e) {
        switch (e.code) {
            case 'ArrowRight':
                this.defender.setspeed(new Vector(this.speed, 0));
                break;
        
            case 'ArrowLeft':
                this.defender.setspeed(new Vector(-this.speed, 0));
                break;

            default:
                break;
        }
    }

    onkeyup(e) {
        switch (e.code) {
            case 'ArrowRight':
            case 'ArrowLeft':
                this.defender.setspeed(new Vector(0, 0));
                break;

            case 'Space':
                this.missiles.push(this.defender.fire());
                break;
    
            default:
                break;
        }
    }

    update(timestamp) {
        this.defender.update(timestamp);
        this.defender.checkbounds(this.bounds);

        for(var i = this.missiles.length-1; i >= 0; i--) {
            var m = this.missiles[i];
            m.update(timestamp);
            if (!m.checkbounds(this.bounds)) {
                this.missiles.splice(i, 1);
            }
        }
    }

    redraw(timestamp) {
        this.ctx.clearRect(0, 0, this.width, this.height); // clear canvas
        this.defender.draw(ctx, timestamp);

        for(var i = this.missiles.length-1; i >= 0; i--) {
            var m = this.missiles[i];
            m.draw(ctx, timestamp);
        }
    }
}

class Actor {
    constructor(origin, width, height) {
        this.origin = origin;
        this.speed = new Vector(0,0);
        this.bounds = Rect.fromcenter(this.origin, width, height);
    }

    setspeed(v) {
        this.speed = v;
    }

    update(timestamp) {
        this.origin = this.origin.add(this.speed);
        this.bounds = this.bounds.translate(this.speed);
    }

    checkbounds(rect) {
        return rect.pointinside(this.origin)
    }

    drawtranslated(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    draw(ctx, timestamp) {
        ctx.save();
        ctx.translate(this.origin.x, this.origin.y);

        this.drawtranslated(ctx);
       
        ctx.restore();
    }
}

class Defender extends Actor {
    constructor(origin) {
        super(origin, 20, 10);
    }

    fire() {
        return new Missile(this.origin.add(new Vector(0, -10)), new Vector(this.speed.x, -5));
    }

    checkbounds(rect) {
        var myBounds = rect.shrink(this.bounds.width/2, 0, this.bounds.width, 0);
        if (!myBounds.pointinside(this.origin))
        {
            this.origin = myBounds.toinside(this.origin);
            this.setspeed(new Vector(0, 0));
        }
        return true;
    }

    drawtranslated(ctx) {
        ctx.beginPath();
        ctx.rect(-this.bounds.width/2, 0, this.bounds.width, -this.bounds.height/3);
        ctx.rect(-this.bounds.width/4, 0, this.bounds.width/2, -this.bounds.height*2/3);
        ctx.rect(-this.bounds.width/8, 0, this.bounds.width/4, -this.bounds.height);
        ctx.fillStyle = "#aa88aa";
        ctx.fill();
        ctx.closePath();

        super.drawtranslated(ctx);
    }
}

class Missile extends Actor {
    constructor(origin, speed) {
        super(origin, 2, 5);
        this.setspeed(speed);
    }

    drawtranslated(ctx) {
        ctx.beginPath();
        ctx.rect(-this.bounds.width/2, -this.bounds.height/2, this.bounds.width, this.bounds.height);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        ctx.closePath();
    }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(d) {
        return new Vector(this.x + d.x, this.y + d.y)
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
        return r.corners().all(rv => this.pointinside(rv));
    }

    overlaps(r) {
        return r.corners().any(rv => this.pointinside(rv));
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