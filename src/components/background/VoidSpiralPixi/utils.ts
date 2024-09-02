import { Point, PointLike } from "pixi.js";

export function outsideRectSample(): number {
    const sample = Math.random();

    if (sample > 0.5) {
        return 1 + sample;
    }
    return -sample;
}

export function magnitude(point: PointLike): number {
    return Math.sqrt(
        Math.pow(point.x, 2) +
        Math.pow(point.y, 2)
    );
}

export function normalize(point: PointLike): PointLike {
    const mag = magnitude(point);
    return new Point(
        point.x / mag,
        point.y / mag,
    );
}

export function dot(a: PointLike, b: PointLike): number {
    return a.x * b.x + a.y * b.y;
}
