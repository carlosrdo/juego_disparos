import type { Game } from './Game';
import { Opponent } from './Opponent';

export class Boss extends Opponent {
    health: number;

    constructor(game: Game, x: number, y: number, width: number, height: number, speed: number) {
        super(game, x, y, width, height, speed * 2);
        this.image.src = '/assets/boss.svg';
        this.myImage = '/assets/boss.svg';
        this.deadImage = '/assets/star.svg';
        this.health = 3;
    }

    collide(): void {
        if(this.dead) return;
        this.health--;
        if (this.health <= 0) {
            this.game.score++;
            this.game.updateHud();
            super.collide();
        }
    }
}
