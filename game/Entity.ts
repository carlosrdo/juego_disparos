export interface EntityState {
  x: number;
  y: number;
  width: number;
  height: number;
  imageKey: string;
}

export class Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  imageKey: string;

  constructor(x: number, y: number, width: number, height: number, imageKey: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.imageKey = imageKey;
  }

  getState(): EntityState {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      imageKey: this.imageKey,
    };
  }
}
