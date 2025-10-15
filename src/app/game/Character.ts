import type { Game } from './Game';
import { Entity } from './Entity';

export class Character extends Entity {
    dead: boolean = false;
    myImage: string;
    deadImage: string;
    game: Game;

    constructor(game: Game, x: number, y: number, width: number, height: number, myImage: string, deadImage: string) {
        super(x, y, width, height, myImage);
        this.myImage = myImage;
        this.deadImage = deadImage;
        this.game = game;
    }

    collide(): void {
        this.dead = true;
        this.image.src = this.deadImage;
    }
}
