import type { Game } from './Game';
import { Character, CharacterState } from './Character';

const PLAYER_INITIAL_LIVES = 3;

export interface PlayerState extends CharacterState {
  lives: number;
}

export class Player extends Character {
  lives: number;

  constructor(game: Game, x: number, y: number, width: number, height: number) {
    super(game, x, y, width, height, 'player', 'star');
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
      this.imageKey = this.deadImage;
      setTimeout(() => {
        if (this.game.isRunning()) {
          this.dead = false;
          this.imageKey = this.myImage;
        }
      }, 2000);
    }
  }

  getState(): PlayerState {
    return {
      ...super.getState(),
      lives: this.lives,
    };
  }
}
