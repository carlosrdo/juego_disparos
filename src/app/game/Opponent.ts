import type { Game } from './Game';
import { Character } from './Character';
import { Shot } from './Shot';

export class Opponent extends Character {
    speed: number;
    
    constructor(game: Game, x: number, y: number, width: number, height: number, speed: number) {
        super(game, x, y, width, height, '/assets/triangle.svg', '/assets/star.svg');
        this.speed = speed;
    }

    collide(): void {
        if(this.dead) return;
        this.game.score++;
        this.game.updateHud();
        super.collide();
    }

    update(): void {
        this.x += this.speed;
        if (this.x <= 0 || this.x + this.width >= this.game.canvas.width) {
            this.speed *= -1;
        }
    }

    shoot(): void {
        if (!this.dead) {
            const shot = new Shot(this.x + this.width / 2 - 2.5, this.y + this.height, 5, 10, 10, '/assets/shot_enemy.svg');
            this.game.opponentShots.push(shot);
        }
    }
}
