'use strict';

class Game {
    constructor(ctx) {
        this.speed = 5;
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.bounds = new Rect(0, 0, this.width, this.height);
        this.score = 0;

        this.defender = new Defender(new Vector(this.width/2, this.height-10));
        
        this.fortresses = [];
        for (var x = 20; x < this.width - 20; x += 60) {
            this.fortresses.push(new Fortress(new Vector(x, this.height-25)));
        }

        this.attackers = [];
        for (var y = 30; y <= 120; y+= 30) {
            for (var x = 100; x < this.width - 100; x += 30) {
                this.attackers.push(new Attacker(new Vector(x, y)));
            }
        }

        this.projectiles = [];
        this.actors = [this.defender, ...this.fortresses, ...this.attackers, ...this.projectiles];
    }

    onkeydown(e) {
        switch (e.code) {
            case 'ArrowRight':
                this.defender.setSpeed(new Vector(this.speed-1+Math.random(), 0));
                break;
        
            case 'ArrowLeft':
                this.defender.setSpeed(new Vector(-this.speed+1-Math.random(), 0));
                break;

            default:
                break;
        }
    }

    onkeyup(e) {
        switch (e.code) {
            case 'ArrowRight':
            case 'ArrowLeft':
                this.defender.setSpeed(new Vector(0, 0));
                break;

            case 'Space':
                this.projectiles.push(this.defender.fire());
                break;
    
            default:
                break;
        }
    }

    deleteActor(actor)
    {
        var coll = this.getActorCollection(actor);

        if (!coll) return;

        coll.splice(coll.indexOf(actor), 1);
    }

    getActorCollection(actor) {
        switch(true)
        {
            case actor instanceof Fortress:
                return this.fortresses;

            case actor instanceof Attacker:
                return this.attackers;

            case actor instanceof Missile:
            case actor instanceof Bomb:
                return this.projectiles;
        }

        return null;
    }

    update(timestamp) {
        this.actors.forEach(a => a.update(ctx, timestamp));

        this.defender.checkBounds(this.bounds);

        this.attackers.forEach(a => {
            a.checkBounds(this.bounds);
            a.setSpeed(a.speed.add(new Vector(0, 0.00001)));
        });

        this.projectiles.push(...this.attackers.filter(a => Math.random() > 0.999).map(a => a.fire()));

        this.projectiles.filter(m => !m.checkBounds(this.bounds)).forEach(m => this.deleteActor(m));

        var hitProjectiles = this.projectiles.filter(p => this.actors.some(a => a.hitBy(p)));
        hitProjectiles.forEach(p => p.health--);
        this.score += hitProjectiles.filter(p => p instanceof Missile).length;

        this.actors.filter(a => a.isDead()).forEach(a => this.deleteActor(a));

        this.actors = [this.defender, ...this.fortresses, ...this.attackers, ...this.projectiles];
    }

    redraw(timestamp) {
        this.ctx.clearRect(0, 0, this.width, this.height); // clear canvas

        ctx.fillStyle = 'blue';
        ctx.font = '12px georgia';
        ctx.fillText(`Score: ${this.score}`, 10, 20)
        ctx.fillText(`Health: ${this.defender.health}`, 70, 20)

        for (const actor of this.actors) actor.draw(ctx, timestamp);
    }

    gameOver() {
        
        const defeated = this.attackers.some(a => a.bounds.y > this.height - 30);

        if (this.defender.isDead() || defeated) {
            ctx.fillStyle = 'red';
            ctx.font = '48px georgia';
            ctx.fillText("Game Over!", this.width/4, this.height/2);
            return true;
        }

        if (this.attackers.length <= 0) {
            ctx.fillStyle = 'darkgrey';
            ctx.font = '48px georgia';
            ctx.fillText("Success!", this.width/4, this.height/2)
            return true;
        }

        return false;
    }
}
