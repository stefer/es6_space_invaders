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

        this.missiles = [];
        this.actors = [this.defender, ...this.fortresses, ...this.attackers, ...this.missiles];
    }

    onkeydown(e) {
        switch (e.code) {
            case 'ArrowRight':
                this.defender.setspeed(new Vector(this.speed-1+Math.random(), 0));
                break;
        
            case 'ArrowLeft':
                this.defender.setspeed(new Vector(-this.speed+1-Math.random(), 0));
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

        if (actor instanceof Attacker)
        {
            this.attackers.splice(this.attackers.indexOf(actor), 1);
        }
    }

    update(timestamp) {
        for (const actor of this.actors) {
            actor.update(ctx, timestamp);
        }

        this.defender.checkbounds(this.bounds);

        for (const a of this.attackers) {
            a.checkbounds(this.bounds);
            if (Math.random() > 0.999) {
                this.missiles.push(a.fire());
            }
            a.setspeed(a.speed.add(new Vector(0, 0.00001)));
        }

        for(var i = this.missiles.length-1; i >= 0; i--) {
            var m = this.missiles[i];
            var remove = !m.checkbounds(this.bounds);

            for (let j = 0; j < this.actors.length; j++) {
                const actor = this.actors[j];
                if (actor !== m && actor.hitBy(m)) {
                    remove = true;
                    if (m instanceof Missile) {
                        this.score++;
                    }
                } 
            }

            if (remove) { 
                this.missiles.splice(i, 1);
            }
        }

        for (const a of this.actors) {
            if (a.isDead()) {
                this.deleteActor(a);
            }
        }

        this.actors = [this.defender, ...this.fortresses, ...this.attackers, ...this.missiles];

        return !this.defender.isDead() && this.attackers.length > 0;
    }

    redraw(timestamp) {
        this.ctx.clearRect(0, 0, this.width, this.height); // clear canvas

        ctx.fillStyle = 'blue';
        ctx.font = '12px georgia';
        ctx.fillText(`Score: ${this.score}`, 10, 20)
        ctx.fillText(`Health: ${this.defender.health}`, 70, 20)

        for (const actor of this.actors) {
            actor.draw(ctx, timestamp);            
        }
    }

    gameOver() {
        if (this.defender.isDead()) {
            ctx.fillStyle = 'red';
            ctx.font = '48px georgia';
            ctx.fillText("Game Over!", this.width/4, this.height/2)
        }
        else {
            ctx.fillStyle = 'darkgrey';
            ctx.font = '48px georgia';
            ctx.fillText("Success!", this.width/4, this.height/2)
        }
    }
}
