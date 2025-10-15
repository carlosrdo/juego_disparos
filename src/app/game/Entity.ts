export class Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    image: HTMLImageElement;

    constructor(x: number, y: number, width: number, height: number, imgSrc: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imgSrc;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}
