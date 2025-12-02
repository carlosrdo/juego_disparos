import { Player, PlayerState } from './Player';
import { Opponent, OpponentState } from './Opponent';
import { Boss, BossState } from './Boss';
import { Shot, ShotState } from './Shot';

const GAME_SPEED_MS = 50;
const OPPONENT_BASE_SPEED = 8;
const OPPONENT_SHOOT_PROBABILITY = 0.1;

export type GameStatus = 'START' | 'RUNNING' | 'GAME_OVER_WIN' | 'GAME_OVER_LOSE';

export interface GameState {
  player: PlayerState | null;
  opponent: OpponentState | BossState | null;
  shots: ShotState[];
  opponentShots: ShotState[];
  score: number;
  lives: number;
  status: GameStatus;
}

export type GameStateCallback = (state: GameState) => void;

export class Game {
  canvasWidth: number;
  canvasHeight: number;
  player: Player | null = null;
  opponent: Opponent | Boss | null = null;
  shots: Shot[] = [];
  opponentShots: Shot[] = [];
  score: number = 0;
  private status: GameStatus = 'START';
  private opponentsDefeated: number = 0;
  private gameInterval: ReturnType<typeof setInterval> | null = null;
  private onStateChange: GameStateCallback | null = null;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  setOnStateChange(callback: GameStateCallback): void {
    this.onStateChange = callback;
  }

  setDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    if (this.player) {
      // Keep player within bounds when dimensions change
      if (this.player.x + this.player.width > this.canvasWidth) {
        this.player.x = this.canvasWidth - this.player.width;
      }
    }
  }

  public isGameOver = (): boolean => this.status === 'GAME_OVER_WIN' || this.status === 'GAME_OVER_LOSE';
  public isRunning = (): boolean => this.status === 'RUNNING';

  public start = (): void => {
    if (this.status === 'RUNNING') return;

    this.status = 'RUNNING';
    this.score = 0;
    this.opponentsDefeated = 0;
    this.shots = [];
    this.opponentShots = [];

    this.player = new Player(
      this,
      this.canvasWidth / 2 - 25,
      this.canvasHeight - 60,
      50,
      50
    );
    this.opponent = new Opponent(this, 10, 30, 50, 44, OPPONENT_BASE_SPEED);

    this.notifyStateChange();
    this.gameInterval = setInterval(this.update, GAME_SPEED_MS);
  };

  private update = (): void => {
    if (!this.player || this.status !== 'RUNNING') return;

    this.opponent?.update();
    if (this.opponent && Math.random() < OPPONENT_SHOOT_PROBABILITY) {
      this.opponent.shoot();
    }

    this.shots.forEach((shot) => shot.update());
    this.shots = this.shots.filter((shot) => shot.y > -shot.height);

    this.opponentShots.forEach((shot) => shot.update());
    this.opponentShots = this.opponentShots.filter(
      (shot) => shot.y < this.canvasHeight
    );

    this.checkCollisions();
    this.notifyStateChange();
  };

  public movePlayer = (direction: 'left' | 'right'): void => {
    if (!this.player || this.status !== 'RUNNING' || this.player.dead) return;

    const moveAmount = 10;
    if (
      direction === 'right' &&
      this.player.x + this.player.width < this.canvasWidth
    ) {
      this.player.x += moveAmount;
    } else if (direction === 'left' && this.player.x > 0) {
      this.player.x -= moveAmount;
    }
    this.notifyStateChange();
  };

  public movePlayerTo = (x: number): void => {
    if (!this.player || this.status !== 'RUNNING' || this.player.dead) return;

    this.player.x = Math.max(
      0,
      Math.min(x - this.player.width / 2, this.canvasWidth - this.player.width)
    );
    this.notifyStateChange();
  };

  public addShot = (): void => {
    if (this.player && !this.player.dead && this.shots.length < 5) {
      this.shots.push(
        new Shot(
          this.player.x + this.player.width / 2 - 2.5,
          this.player.y,
          5,
          20,
          -30,
          'shot_player'
        )
      );
      this.notifyStateChange();
    }
  };

  private checkCollisions = (): void => {
    if (!this.player || !this.opponent) return;

    this.shots.forEach((shot, shotIndex) => {
      if (
        !this.opponent!.dead &&
        shot.x < this.opponent!.x + this.opponent!.width &&
        shot.x + shot.width > this.opponent!.x &&
        shot.y < this.opponent!.y + this.opponent!.height &&
        shot.y + shot.height > this.opponent!.y
      ) {
        this.shots.splice(shotIndex, 1);
        this.opponent!.collide();
        if (this.opponent!.dead) {
          setTimeout(() => this.removeOpponent(this.opponent!), 1000);
        }
      }
    });

    this.opponentShots.forEach((shot, shotIndex) => {
      if (
        !this.player!.dead &&
        shot.x < this.player!.x + this.player!.width &&
        shot.x + shot.width > this.player!.x &&
        shot.y < this.player!.y + this.player!.height &&
        shot.y + shot.height > this.player!.y
      ) {
        this.opponentShots.splice(shotIndex, 1);
        this.player!.collide();
      }
    });
  };

  private removeOpponent = (opponent: Opponent | Boss): void => {
    if (this.status !== 'RUNNING') return;

    if (opponent instanceof Boss) {
      this.endGame(true);
    } else {
      this.opponentsDefeated++;
      if (this.opponentsDefeated >= 2) {
        this.opponent = new Boss(this, 10, 30, 60, 58, OPPONENT_BASE_SPEED);
      } else {
        this.opponent = new Opponent(
          this,
          10,
          30,
          50,
          44,
          OPPONENT_BASE_SPEED * (this.opponentsDefeated + 1)
        );
      }
      this.notifyStateChange();
    }
  };

  public updateHud = (): void => {
    this.notifyStateChange();
  };

  public endGame = (win: boolean): void => {
    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = null;
    this.status = win ? 'GAME_OVER_WIN' : 'GAME_OVER_LOSE';
    this.notifyStateChange();
  };

  public destroy = (): void => {
    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = null;
  };

  public getState = (): GameState => {
    return {
      player: this.player?.getState() ?? null,
      opponent: this.opponent?.getState() ?? null,
      shots: this.shots.map((s) => s.getState()),
      opponentShots: this.opponentShots.map((s) => s.getState()),
      score: this.score,
      lives: this.player?.lives ?? 0,
      status: this.status,
    };
  };

  private notifyStateChange = (): void => {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  };
}
