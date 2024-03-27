import { Point } from '@pixi/math';

// Copy from pixi event system
export function mapPositionToPoint(
    canvasElement: HTMLCanvasElement,
    eventsElement: HTMLElement,
    resolution: number,
    x: number,
    y: number,
    point: Point = new Point(),
): Point {
    const resolutionMultiplier = 1 / resolution;
    const rect = eventsElement.getBoundingClientRect();

    point.x = (x - rect.left) * (canvasElement.width / rect.width) * resolutionMultiplier;
    point.y = (y - rect.top) * (canvasElement.height / rect.height) * resolutionMultiplier;

    return point;
}
