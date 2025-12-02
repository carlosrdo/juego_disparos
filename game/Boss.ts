import type { Game } from './Game';
import { Opponent, OpponentState } from './Opponent';

export interface BossState extends OpponentState {
  health: number;
}

export class Boss extends Opponent {
  health: number;

  constructor(
    game: Game,
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number
  ) {
    super(game, x, y, width, height, speed * 2);
    this.imageKey = 'boss';
    this.myImage = 'boss';
    this.deadImage = 'star';
    this.health = 3;
  }

  collide(): void {
    if (this.dead) return;
    this.health--;
    if (this.health <= 0) {
      this.game.score++;
      this.game.updateHud();
      this.dead = true;
      this.imageKey = this.deadImage;
    }
  }

  getState(): BossState {
    return {
      ...super.getState(),
      health: this.health,
    };
  }
}
