import { Entity } from './Entity';

export class Shot extends Entity {
    speed: number;

    constructor(x: number, y: number, width: number, height: number, speed: number, imgSrc: string) {
        super(x, y, width, height, imgSrc);
        this.speed = speed;
    }

    update(): void {
        this.y += this.speed;
    }
}
