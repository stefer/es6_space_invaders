'use strict';

class Game {
    constructor(ctx) {
        this.speed = 5;
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.bounds = new Rect(0, 0, this.width, this.height);

        this.defender = new Defender(new Vector(this.width/2, this.height-10));
        this.fortresses = [
            new Fortress(new Vector(this.width/2, this.height-25))
        ];
        this.missiles = [];
        this.actors = [this.defender, ...this.fortresses, ...this.missiles];
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

    deleteActor(actor)
    {
        if (actor instanceof Fortress)
        {
            this.fortresses.splice(this.fortresses.indexOf(actor), 1);
        }
    }

    update(timestamp) {
        for (const actor of this.actors) {
            actor.update(ctx, timestamp);
        }

        this.defender.checkbounds(this.bounds);

        for(var i = this.missiles.length-1; i >= 0; i--) {
            var m = this.missiles[i];
            var remove = !m.checkbounds(this.bounds);

            for (let j = 0; j < this.actors.length; j++) {
                const actor = this.actors[j];
                if (actor !== m && actor.hitBy(m)) {
                    remove = true;
                    if (actor.isDead()) {
                        this.deleteActor(actor);
                    }
                } 
            }

            if (remove) { 
                this.missiles.splice(i, 1);
            }
        }
        this.actors = [this.defender, ...this.fortresses, ...this.missiles];
    }

    redraw(timestamp) {
        this.ctx.clearRect(0, 0, this.width, this.height); // clear canvas

        for (const actor of this.actors) {
            actor.draw(ctx, timestamp);            
        }
    }
}

class Actor {
    constructor(origin, width, height) {
        this.origin = origin;
        this.speed = new Vector(0,0);
        this.bounds = Rect.fromcenter(this.origin, width, height);
        this.health = 5;
        this.hits = [];
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

    isDead() {
        return this.health <= 0;
    }

    hitBy(actor) {
        if (this.bounds.overlaps(actor.bounds))
        {
            var translation = actor.origin.subtract(this.origin);
            this.hits.push(Rect.fromcenter(translation, actor.bounds.width, actor.bounds.height));
            this.health--
            return true;
        }
        return false;
    }

    drawtranslated(ctx) {   
        ctx.strokeStyle = "#00ff00";
        const localBounds = this.bounds.local();
        ctx.strokeRect(localBounds.x, localBounds.y, localBounds.width, localBounds.height);

        for (const hit of this.hits) {
            ctx.clearRect(hit.x, hit.y, hit.width, hit.height);
        }
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
        ctx.fillStyle = "#aa88aa";
        ctx.fillRect(-this.bounds.width/2, this.bounds.height/2, this.bounds.width, -this.bounds.height/3);
        ctx.fillRect(-this.bounds.width/4, this.bounds.height/2, this.bounds.width/2, -this.bounds.height*2/3);
        ctx.fillRect(-this.bounds.width/8, this.bounds.height/2, this.bounds.width/4, -this.bounds.height);

        super.drawtranslated(ctx);
    }
}

class Missile extends Actor {
    constructor(origin, speed) {
        super(origin, 2, 5);
        this.setspeed(speed);
    }

    drawtranslated(ctx) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(-this.bounds.width/2, -this.bounds.height/2, this.bounds.width, this.bounds.height);

        super.drawtranslated(ctx);
    }
}

class Fortress extends Actor
{
    constructor(origin) {
        super(origin, 20, 10);
    }

    drawtranslated(ctx) {
        var width = this.bounds.width;
        var height = this.bounds.height;
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(-width/2, height/2);
        ctx.lineTo(-width/2, 0);
        ctx.lineTo(0, -height/2);
        ctx.lineTo(width/2, 0);
        ctx.lineTo(width/2, height/2);
        ctx.closePath();
        ctx.fill();

        super.drawtranslated(ctx);
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