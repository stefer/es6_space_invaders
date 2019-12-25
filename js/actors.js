'use strict';

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
        if (actor !== this && this.bounds.overlaps(actor.bounds))
        {
            var translation = actor.origin.subtract(this.origin);
            this.hits.push(Rect.fromcenter(translation, actor.bounds.width*1.5, actor.bounds.height*1.5));
            this.health--
            return true;
        }
        return false;
    }

    drawtranslated(ctx) {   

        // ctx.strokeStyle = "#00ff00";
        // const localBounds = this.bounds.local();
        // ctx.strokeRect(localBounds.x, localBounds.y, localBounds.width, localBounds.height);

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

class Attacker extends Actor {
    constructor(origin) {
        super(origin, 20, 10);
        this.health = 2;
        this.originalPos = origin;
        this.setspeed(new Vector(0.1, 0.02));
    }

    fire() {
        return new Bomb(this.origin.add(new Vector(0, 10)), new Vector(this.speed.x, 3));
    }

    checkbounds(rect) {
        if (Math.abs(this.originalPos.x - this.origin.x) > 40) {
            this.setspeed(new Vector(-this.speed.x, this.speed.y));
        }

        return true;
    }

    hitBy(actor) {
        return !(actor instanceof Bomb) && super.hitBy(actor);
    }

    drawtranslated(ctx) {
        var height = this.bounds.height;
        var width = this.bounds.width;
        ctx.fillStyle = "brown";
        ctx.strokeStyle = "brown";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, height/2, 0, 2 * Math.PI, false);
        ctx.arc(0, height*2/3, height/3, 0, 2 * Math.PI, false);
        ctx.moveTo(-width/2, 0);
        ctx.lineTo(0, 0);
        ctx.moveTo(width/2, 0);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        super.drawtranslated(ctx);
    }
}

class Missile extends Actor {
    constructor(origin, speed) {
        super(origin, 2, 5);
        this.setspeed(speed);
        this.health = 1;
    }

    drawtranslated(ctx) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(-this.bounds.width/2, -this.bounds.height/2, this.bounds.width, this.bounds.height);

        super.drawtranslated(ctx);
    }
}

class Bomb extends Actor {
    constructor(origin, speed) {
        super(origin, 2, 5);
        this.setspeed(speed);
        this.health = 1;
    }

    drawtranslated(ctx) {
        ctx.fillStyle = "brown";
        ctx.fillRect(-this.bounds.width/2, -this.bounds.height/2, this.bounds.width, this.bounds.height);

        super.drawtranslated(ctx);
    }
}

class Fortress extends Actor
{
    constructor(origin) {
        super(origin, 20, 10);
        this.health = 10;
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
