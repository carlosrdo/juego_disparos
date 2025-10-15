import { Player } from './Player';
import { Opponent } from './Opponent';
import { Boss } from './Boss';
import { Shot } from './Shot';

const GAME_SPEED_MS = 50;
const OPPONENT_BASE_SPEED = 4;
const OPPONENT_SHOOT_PROBABILITY = 0.05;

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player | null = null;
    opponent: Opponent | Boss | null = null;
    shots: Shot[] = [];
    opponentShots: Shot[] = [];
    keyPressed: string | null = null;
    xDown: number | null = null;
    gameInterval: NodeJS.Timeout | null = null;
    score: number = 0;
    private _gameOver: boolean = true;
    private _running: boolean = false;

    private startScreen: HTMLElement | null;
    private gameOverlay: HTMLElement | null;
    private gameMessage: HTMLImageElement | null;
    private scoreLi: HTMLElement | null;
    private livesLi: HTMLElement | null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        this.startScreen = document.getElementById('start-screen');
        this.gameOverlay = document.getElementById('game-overlay');
        this.gameMessage = document.getElementById('game-message') as HTMLImageElement;
        this.scoreLi = document.getElementById('scoreli');
        this.livesLi = document.getElementById('livesli');

        this.addEventListeners();
    }

    public isGameOver = (): boolean => this._gameOver;
    public isRunning = (): boolean => this._running;

    public start = (): void => {
        if (this._running) return;

        this._gameOver = false;
        this._running = true;
        this.score = 0;
        this.shots = [];
        this.opponentShots = [];

        if (this.startScreen) this.startScreen.style.display = 'none';
        if (this.gameOverlay) this.gameOverlay.style.display = 'none';

        this.player = new Player(this, this.canvas.width / 2 - 25, this.canvas.height - 60, 50, 50);
        this.opponent = new Opponent(this, 10, 30, 50, 44, OPPONENT_BASE_SPEED);

        this.updateHud();
        this.gameInterval = setInterval(this.update, GAME_SPEED_MS);
    }

    private keydownHandler = (e: KeyboardEvent) => { this.keyPressed = e.key; };
    private keyupHandler = () => { this.keyPressed = null; };
    private touchStartHandler = (e: TouchEvent) => { this.xDown = e.touches[0].clientX; e.preventDefault(); };
    private touchMoveHandler = (e: TouchEvent) => {
        if (this.xDown === null || !this.player) return;
        const xUp = e.touches[0].clientX;
        const diff = this.xDown - xUp;
        this.player.x -= diff;
        
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }

        this.xDown = xUp;
        e.preventDefault();
    };
    private touchEndHandler = (e: TouchEvent) => {
        if (this.xDown !== null) {
            this.addShot();
        }
        this.xDown = null;
        e.preventDefault();
    };

    private addEventListeners = (): void => {
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        this.canvas.addEventListener('touchend', this.touchEndHandler, { passive: false });
    }

    private removeEventListeners = (): void => {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
        this.canvas.removeEventListener('touchend', this.touchEndHandler);
    }
    
    private update = (): void => {
        if (!this.player || !this._running) return;

        if (this.keyPressed === 'ArrowRight' && this.player.x + this.player.width < this.canvas.width) {
            this.player.x += 10;
        } else if (this.keyPressed === 'ArrowLeft' && this.player.x > 0) {
            this.player.x -= 10;
        }

        if (this.keyPressed === ' ') {
            this.addShot();
            this.keyPressed = null;
        }

        this.opponent?.update();
        if (this.opponent && Math.random() < OPPONENT_SHOOT_PROBABILITY) {
            this.opponent.shoot();
        }

        this.shots.forEach(shot => shot.update());
        this.shots = this.shots.filter(shot => shot.y > -shot.height);
        
        this.opponentShots.forEach(shot => shot.update());
        this.opponentShots = this.opponentShots.filter(shot => shot.y < this.canvas.height);

        this.checkCollisions();
        this.draw();
    }
    
    public addShot = (): void => {
        if (this.player && !this.player.dead && this.shots.length < 5) {
            this.shots.push(new Shot(this.player.x + this.player.width / 2 - 2.5, this.player.y, 5, 20, -20, '/assets/shot_player.svg'));
        }
    }

    private checkCollisions = (): void => {
        if (!this.player || !this.opponent) return;

        this.shots.forEach((shot, shotIndex) => {
            if (
                !this.opponent!.dead &&
                shot.x < this.opponent!.x + this.opponent!.width && shot.x + shot.width > this.opponent!.x &&
                shot.y < this.opponent!.y + this.opponent!.height && shot.y + shot.height > this.opponent!.y
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
                shot.x < this.player!.x + this.player!.width && shot.x + shot.width > this.player!.x &&
                shot.y < this.player!.y + this.player!.height && shot.y + shot.height > this.player!.y
            ) {
                this.opponentShots.splice(shotIndex, 1);
                this.player!.collide();
            }
        });
    }

    private removeOpponent = (opponent: Opponent | Boss): void => {
        if (!this._running) return;
        if (opponent instanceof Boss) {
            this.endGame(true);
        } else {
            this.opponent = new Boss(this, 10, 30, 60, 58, OPPONENT_BASE_SPEED);
        }
    }

    private draw = (): void => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player?.draw(this.ctx);
        this.opponent?.draw(this.ctx);
        this.shots.forEach(shot => shot.draw(this.ctx));
        this.opponentShots.forEach(shot => shot.draw(this.ctx));
    }

    public updateHud = (): void => {
        if (this.scoreLi) this.scoreLi.innerHTML = `Score: ${this.score}`;
        if (this.livesLi && this.player) this.livesLi.innerHTML = `Lives: ${this.player.lives}`;
    }

    public endGame = (win: boolean): void => {
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.gameInterval = null;
        this._gameOver = true;
        this._running = false;

        if (this.gameOverlay && this.gameMessage) {
            this.gameOverlay.style.display = 'flex';
            this.gameMessage.src = win ? '/assets/you_win.svg' : '/assets/game_over.svg';
        }
    }

    public destroy = (): void => {
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.removeEventListeners();
        this._running = false;
    }
}
