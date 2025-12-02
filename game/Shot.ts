import { Entity, EntityState } from './Entity';

export interface ShotState extends EntityState {
  speed: number;
}

export class Shot extends Entity {
  speed: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number,
    imageKey: string
  ) {
    super(x, y, width, height, imageKey);
    this.speed = speed;
  }

  update(): void {
    this.y += this.speed;
  }

  getState(): ShotState {
    return {
      ...super.getState(),
      speed: this.speed,
    };
  }
}
