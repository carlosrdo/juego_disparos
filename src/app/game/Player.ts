import type { Game } from './Game';
import { Character } from './Character';

const PLAYER_INITIAL_LIVES = 3;

export class Player extends Character {
    lives: number;

    constructor(game: Game, x: number, y: number, width: number, height: number) {
        super(game, x, y, width, height, '/assets/player.svg', '/assets/star.svg');
        this.lives = PLAYER_INITIAL_LIVES;
    }

    collide(): void {
        if (this.dead) return;

        this.lives--;
        this.game.updateHud();

        if (this.lives <= 0) {
            super.collide();
            this.game.endGame(false);
        } else {
            this.dead = true;
            this.image.src = this.deadImage;
            setTimeout(() => {
                if (this.game.isRunning()) {
                    this.dead = false;
                    this.image.src = this.myImage;
                }
            }, 2000);
        }
    }
}
