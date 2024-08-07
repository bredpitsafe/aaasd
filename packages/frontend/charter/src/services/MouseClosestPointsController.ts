import type { TPoint } from '@frontend/common/src/types/shape';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import {
    decreaseIndexWhileBigger,
    findFirstLeftNotEqualTo,
    findLeftClosestIndex,
    findRightIndexByEqual,
    increaseIndexWhileEqual,
} from '@frontend/common/src/utils/findClosest';
import { isNil } from 'lodash-es';
import { Container } from 'pixi.js';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';

import type {
    TPart,
    TPartAbsPoint,
    TPartAbsPointCoord,
    TPartClosestAbsPoint,
    TPartPoint,
    TSeriesId,
} from '../../lib/Parts/def';
import { POINT_ITEM_SIZE } from '../../lib/Parts/def';
import { partForEachRight } from '../../lib/Parts/utils/iterators';
import { getAbsPoint, toAbsPoint } from '../../lib/Parts/utils/point';
import { createLocalState } from '../Charter/methods';
import { EChartType } from '../components/Chart/defs';
import { MouseClosestPoints } from '../components/MouseClosestPoints';
import type { IContext } from '../types';
import { createPartsChangeDetector } from '../utils/Detectors/createPartsChangeDetector';
import type { TChartProps } from './ChartsController';
import { START_POINT } from './MouseController';
import type { VirtualViewport } from './VirtualViewportController/VirtualViewport';

export type TClosestPointCursorData = {
    id: TSeriesId;
    point: TPartAbsPoint;
    nonNaNPoint?: TPartAbsPoint;
    canvasPoint?: TPoint;
};

type TPointData = {
    point: TPartAbsPointCoord;
    distance: number;
};

const selectPointsCharts = ({ type }: TChartProps) =>
    type === EChartType.points || type === EChartType.dots;

export class MouseClosestPointsController extends Container {
    private readonly state: {
        closestPoints: TClosestPointCursorData[];
    };
    private readonly destroyer$ = new Subject<void>();

    constructor(public ctx: IContext) {
        super();

        this.state = createLocalState(
            ctx,
            'MouseClosestPointsController',
            (state) =>
                state ?? {
                    closestPoints: [],
                },
        );

        const { stage, chartsController, mouseController, tickerController, partsController } = ctx;

        mouseController.pseudoMouseCoords$
            .pipe(
                switchMap((point) => {
                    const partsChangeDetector = createPartsChangeDetector();

                    return tickerController.getTicker$().pipe(
                        map(() => {
                            const canvasPoint = { x: point.x, y: point.y };

                            const partsChanged = partsChangeDetector(
                                chartsController
                                    .getVisibleChartsIds()
                                    .flatMap((chartId) => partsController.getVisibleParts(chartId)),
                            );

                            return { partsChanged, canvasPoint };
                        }),
                        distinctUntilChanged((prev, next) => {
                            if (next.partsChanged) {
                                return false;
                            }

                            return (
                                prev.canvasPoint.x === next.canvasPoint.x &&
                                prev.canvasPoint.y === next.canvasPoint.y
                            );
                        }),
                        map(({ canvasPoint }) => canvasPoint),
                    );
                }),
                takeUntil(this.destroyer$),
            )
            .subscribe((point) => {
                if (point.x === START_POINT.x && point.y === START_POINT.y) {
                    this.clearClosestPoints();
                } else {
                    this.computeClosestPoints(point);
                }
            });

        const component = stage.addChild(new MouseClosestPoints(ctx));
        this.destroyer$.subscribe(() => {
            stage.removeChild(component);
        });
    }

    destroy(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
    }

    getClosestPoints(): TClosestPointCursorData[] {
        return this.state.closestPoints;
    }

    private clearClosestPoints(): void {
        this.state.closestPoints = EMPTY_ARRAY;
    }

    private computeClosestPoints(point: TPoint): void {
        this.state.closestPoints = this.findLeftClosestPoints(point);
    }

    private findLeftClosestPoints(point: TPoint): TClosestPointCursorData[] {
        const chartProps = this.ctx.chartsController.getVisibleChartsProps();
        const singlePoint = chartProps.length > 0 && chartProps.every(selectPointsCharts);

        return singlePoint
            ? this.findLeftClosestSinglePoint(point)
            : this.findLeftClosestSlicePoints(point);
    }

    private findLeftClosestSinglePoint(mousePoint: TPoint): TClosestPointCursorData[] {
        const { mouseController, partsController, chartsController, virtualViewportController } =
            this.ctx;

        let closestChartId: undefined | TSeriesId = undefined;
        let closestPointData: undefined | TPointData = undefined;
        let closestVirtualViewport: undefined | VirtualViewport = undefined;

        const chartProps = chartsController.getVisibleChartsProps();

        for (const { id, yAxis } of chartProps) {
            const virtualViewport = virtualViewportController.getVirtualViewport(yAxis);
            const rootPoint = mouseController.getChartMouseCoords(virtualViewport, mousePoint);
            const chartClosestPointData = findLeftClosestPointByDistance(
                partsController.getVisibleParts(id),
                rootPoint,
                virtualViewport.scale,
                closestPointData?.distance,
            );

            if (chartClosestPointData) {
                closestChartId = id;
                closestPointData = chartClosestPointData;
                closestVirtualViewport = virtualViewport;
            }
        }

        return closestChartId && closestPointData && closestVirtualViewport
            ? [
                  {
                      id: closestChartId,
                      point: closestPointData.point,
                      canvasPoint: closestVirtualViewport.toCanvasPoint(closestPointData.point),
                  },
              ]
            : EMPTY_ARRAY;
    }

    private findLeftClosestSlicePoints = (mousePoint: TPoint): TClosestPointCursorData[] => {
        const { mouseController, partsController, chartsController, virtualViewportController } =
            this.ctx;

        const mapChartToOptionalPointData = ({
            id,
            yAxis,
        }: TChartProps): TClosestPointCursorData | undefined => {
            const parts = partsController.getVisibleParts(id);
            const vv = virtualViewportController.getVirtualViewport(yAxis);
            const chartPoint = mouseController.getChartMouseCoords(vv, mousePoint);
            const point = getLeftClosestPointByTime(parts, chartPoint.x);

            if (point === undefined) {
                return undefined;
            }

            const nonNaNArrayPoint = Number.isNaN(point.y)
                ? findFirstNonNaNValue(parts, chartPoint.x)
                : undefined;

            return {
                id,
                point,
                nonNaNPoint: nonNaNArrayPoint === undefined ? undefined : nonNaNArrayPoint,
            };
        };

        return chartsController
            .getVisibleChartsProps()
            .map(mapChartToOptionalPointData)
            .filter((data): data is TClosestPointCursorData => data !== undefined);
    };
}

function getLeftClosestPointByTime(parts: TPart[], timeEdge: number): undefined | TPartAbsPoint {
    const indexes = findPartAndPointIndex(parts, timeEdge);

    return indexes === undefined
        ? undefined
        : getPartClosestPoint(
              parts[indexes.partIndex],
              timeEdge,
              indexes.partIndex,
              indexes.pointPartIndex,
          );
}

const forEachOptions = { max: 0, rightPoint: true };
function findLeftClosestPointByDistance(
    parts: TPart[],
    rootPoint: TPoint,
    scale: TPoint,
    currentDistance = Infinity,
): undefined | TPointData {
    let lookingPoint: undefined | TPartAbsPoint;

    const eachItem = (point: TPartPoint, i: number, part: TPart, stop: VoidFunction) => {
        const absPoint = toAbsPoint(part, point);
        const timeDis = getDistance(rootPoint.x, absPoint.x) * scale.x;
        const distance = timeDis + getDistance(rootPoint.y, absPoint.y) * scale.y;

        if (timeDis > currentDistance) {
            return stop();
        }
        if (currentDistance > distance) {
            currentDistance = distance;
            lookingPoint = absPoint;
        }
    };

    for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i];
        const relTimeEdge = rootPoint.x - part.interval[0];

        forEachOptions.max = decreaseIndexWhileBigger(
            relTimeEdge,
            findRightIndexByEqual(
                findLeftClosestIndex(relTimeEdge, part.buffer, POINT_ITEM_SIZE),
                part.buffer,
                POINT_ITEM_SIZE,
            ),
            part.buffer,
            POINT_ITEM_SIZE,
        );
        forEachOptions.rightPoint = forEachOptions.max === part.size;

        partForEachRight(part, eachItem, forEachOptions);
    }

    return lookingPoint === undefined
        ? undefined
        : {
              distance: currentDistance,
              point: lookingPoint,
          };
}

function getDistance(v1: number, v2: number): number {
    return Math.abs(v1 - v2);
}

function getPartClosestPoint(
    part: TPart,
    timeEdge: number,
    partIndex: number,
    pointPartIndex?: number,
): undefined | TPartAbsPoint {
    if (pointPartIndex !== undefined) {
        return getAbsPoint(part, pointPartIndex);
    }

    if ((part.absRightPoint?.x ?? Infinity) <= timeEdge) {
        return part.absRightPoint!;
    }

    if ((part.absLeftPoint?.x ?? Infinity) <= timeEdge) {
        return part.absLeftPoint!;
    }

    return undefined;
}

function findFirstNonNaNValue(parts: TPart[], timeEdge: number): TPartAbsPoint | undefined {
    const indexes = findPartAndPointIndex(parts, timeEdge);

    if (indexes === undefined) {
        return undefined;
    }

    const leftClosestPoint = getPartClosestPoint(
        parts[indexes.partIndex],
        timeEdge,
        indexes.partIndex,
        indexes.pointPartIndex,
    );

    if (leftClosestPoint === undefined || !Number.isNaN(leftClosestPoint.y)) {
        return undefined;
    }

    if (indexes.pointPartIndex !== undefined) {
        return findFirstNonNaNPoint(parts, indexes.partIndex, indexes.pointPartIndex);
    }

    const indexesByPoint = findPartAndPointIndex(parts, leftClosestPoint.x);

    if (
        indexesByPoint === undefined ||
        (indexesByPoint.partIndex === 0 && indexesByPoint.pointPartIndex === undefined)
    ) {
        return undefined;
    }

    return indexesByPoint.pointPartIndex === undefined
        ? findFirstNonNaNPoint(
              parts,
              indexesByPoint.partIndex - 1,
              parts[indexesByPoint.partIndex - 1].size - 1,
          )
        : findFirstNonNaNPoint(parts, indexesByPoint.partIndex, indexesByPoint.pointPartIndex);
}

function findFirstNonNaNPoint(
    parts: TPart[],
    partIndex: number,
    pointPartIndex?: number,
): undefined | TPartAbsPoint {
    let startPointIndex: number | undefined = pointPartIndex;

    for (; partIndex >= 0; partIndex--) {
        const part = parts[partIndex];

        if (part.size === 0) {
            if (isNonNaNPoint(parts[0].absLeftPoint)) {
                return parts[0].absLeftPoint;
            }

            continue;
        }

        const index = findFirstLeftNotEqualTo(
            NaN,
            startPointIndex ?? part.size - 1,
            part.buffer,
            POINT_ITEM_SIZE,
            1,
        );

        if (index < 0) {
            startPointIndex = undefined;
            continue;
        }

        return getAbsPoint(part, index);
    }

    return partIndex < 0
        ? undefined
        : isNonNaNPoint(parts[0].absLeftPoint)
          ? parts[0].absLeftPoint
          : undefined;
}

function findPartAndPointIndex(
    parts: TPart[],
    timeEdge: number,
): undefined | { partIndex: number; pointPartIndex?: number } {
    for (let partIndex = parts.length - 1; partIndex >= 0; partIndex--) {
        const part = parts[partIndex];

        if (part.interval[0] > timeEdge) {
            if (part.absLeftPoint && part.absLeftPoint.x <= timeEdge) {
                return { partIndex };
            }

            continue;
        }

        const relTimeEdge = timeEdge - part.interval[0];
        const closestIndex = findLeftClosestIndex(relTimeEdge, part.buffer, POINT_ITEM_SIZE);

        const closestRightestEqualPoint = increaseIndexWhileEqual(
            closestIndex,
            part.buffer,
            POINT_ITEM_SIZE,
        );

        const pointPartIndex = decreaseIndexWhileBigger(
            relTimeEdge,
            closestRightestEqualPoint,
            part.buffer,
            POINT_ITEM_SIZE,
        );

        if (pointPartIndex >= 0) {
            return { partIndex, pointPartIndex };
        } else if ((part.absRightPoint?.x ?? Infinity) < timeEdge) {
            return { partIndex };
        } else if ((part.absLeftPoint?.x ?? Infinity) < timeEdge) {
            return { partIndex };
        }
    }

    return undefined;
}

function isNonNaNPoint(
    absLeftPoint: TPartClosestAbsPoint | undefined,
): absLeftPoint is TPartAbsPoint {
    return !isNil(absLeftPoint) && !Number.isNaN(absLeftPoint.y);
}
