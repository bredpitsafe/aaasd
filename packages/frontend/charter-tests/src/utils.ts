import type { Milliseconds, Someseconds } from '@common/types';
import {
    hourInMilliseconds,
    milliseconds2nanoseconds,
    nanoseconds2milliseconds,
    plus,
} from '@common/utils';
import type {
    TPartClosestPoints,
    TPartItemsData,
    TPartPointBuffer,
    TPointAbsTime,
    TPointAbsValue,
    TPointTime,
    TPointValue,
} from '@frontend/charter/lib/Parts/def';
import { POINT_ITEM_SIZE } from '@frontend/charter/lib/Parts/def';
import { createPartAbsPoint, setPoint } from '@frontend/charter/lib/Parts/utils/point';
import { TimeseriesCharter } from '@frontend/charter/src';
import type { MouseController } from '@frontend/charter/src/services/MouseController';
import type {
    TRequestClosestPointsProps,
    TRequestPartsProps,
} from '@frontend/charter/src/services/PartsLoader';
import { hexToPackedRGBA } from '@frontend/common/src/utils/packRGBA';
import { isNil } from 'lodash-es';
import memoizee from 'memoizee';
import { Observable } from 'rxjs';

import type { TTestChartProps } from './defs';
import { getDataGenerator } from './generatePoints';
import type { ECaseName } from './testChartsData';
import { casesMap } from './testChartsData';

export type TPointsSet = { increment: number; items: number[] };
export type TClosestPoint = null | { ts: number; value: number };

export function notExistName(): boolean {
    const testCase = new URLSearchParams(location.search).get('case') as ECaseName;

    return !testCase;
}

export function getTestName(): ECaseName {
    const testCase = new URLSearchParams(location.search).get('case') as ECaseName;

    if (!(testCase in casesMap)) {
        throw new Error(`Test case "${testCase}" is not found`);
    }

    return testCase;
}

export function setMouseCoordinates(charter: TimeseriesCharter, x: number, y: number): () => void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mouseController = (charter as any).charter?.ctx?.mouseController as MouseController;

    const originalGetCanvasMouseCoords = mouseController.getCanvasMouseCoords;

    mouseController.getCanvasMouseCoords = () => ({ x, y });

    const mouseenterEvent = new MouseEvent('mouseenter', {
        view: null,
        bubbles: true,
        cancelable: true,
    });

    setTimeout(() => {
        // Charter work asynchronously, so we should wait some little bit
        charter.getView().dispatchEvent(mouseenterEvent);
    }, 100);

    return () => {
        mouseController.getCanvasMouseCoords = originalGetCanvasMouseCoords;
    };
}

export function getRenderCountDelay(
    canvas: HTMLCanvasElement,
    maxFramesCount = 30,
    timeoutMs = 10_000,
    renderTimeoutMs = 100,
) {
    return new Promise<void>((resolve, reject) => {
        const gl = canvas.getContext('webgl2');

        if (isNil(gl)) {
            reject(new Error('webgl2 context was not retrieved'));
            return;
        }

        let renderTimeout: NodeJS.Timeout | undefined = undefined;
        let wasRendered = false;

        const originalFlush = gl.flush;

        const timeout = setTimeout(() => {
            if (!isNil(renderTimeout)) {
                clearTimeout(renderTimeout);
            }

            gl.flush = originalFlush;

            if (wasRendered) {
                resolve();
            } else {
                reject(new Error('Timeout occurred'));
            }
        }, timeoutMs);

        let framesCountdown = maxFramesCount;

        gl.flush = () => {
            originalFlush.call(gl);

            if (!isNil(renderTimeout)) {
                clearTimeout(renderTimeout);
            }

            renderTimeout = setTimeout(() => {
                clearTimeout(timeout);

                gl.flush = originalFlush;

                resolve();
            }, renderTimeoutMs);

            wasRendered = true;

            if (--framesCountdown < 0) {
                clearTimeout(timeout);
                clearTimeout(renderTimeout);

                gl.flush = originalFlush;

                resolve();
            }
        };
    });
}

export function generateChart(
    container: HTMLElement,
    charts: TTestChartProps[],
    serverTimeIncrementMs = Date.UTC(2021, 0, 1) as Milliseconds,
    viewportTimeStart = Date.UTC(2021, 8, 1, 13, 40, 0) as Milliseconds,
): Promise<TimeseriesCharter> {
    const somesecondsToMilliseconds = nanoseconds2milliseconds as unknown as (
        v: Someseconds,
    ) => Milliseconds;
    const millisecondsToSomeseconds = milliseconds2nanoseconds as unknown as (
        v: Milliseconds,
    ) => Someseconds;
    const serverTimeIncrement = milliseconds2nanoseconds(
        serverTimeIncrementMs,
    ) as unknown as Someseconds;

    return new Promise<TimeseriesCharter>((resolve) => {
        const requestPartsItems = (requestBody: TRequestPartsProps): Observable<TPartItemsData> => {
            const PART_DURATION = 4096;
            const chart = charts.find((chart) => chart.id === requestBody.seriesId)!;
            const getColor = (index: number) =>
                chart.getRGBA?.(index) ?? getPackedRGBA(chart?.color, chart?.opacity);
            const getWidth = (index: number) => chart.getWidth?.(index) ?? chart?.width ?? 1;

            return new Observable((subscriber) => {
                generatePoints(requestBody, serverTimeIncrementMs, PART_DURATION).forEach(
                    ({ increment, items }, index, arr) => {
                        const start = plus(requestBody.startTime, increment);
                        const end =
                            arr.length - 1 === index
                                ? plus(requestBody.startTime, requestBody.maxInterval)
                                : plus(start, items[items.length - 2]);

                        let baseValue = 0;

                        for (let index = 1; index < items.length; index += 2) {
                            const current = items[index];
                            if (!isNil(current) && !isNaN(current)) {
                                baseValue = current;
                                break;
                            }
                        }

                        for (let index = 1; index < items.length; index += 2) {
                            items[index] -= baseValue;
                        }

                        const buffer = Array.from({ length: items.length * 2 }) as TPartPointBuffer;
                        const size = buffer.length / POINT_ITEM_SIZE;

                        for (let i = 0; i < size; i++) {
                            setPoint(
                                buffer,
                                i,
                                items[i * 2] as TPointTime,
                                items[i * 2 + 1] as TPointValue,
                                getColor(i),
                                getWidth(i),
                            );
                        }

                        const partItem: TPartItemsData = {
                            interval: [start, end],
                            baseValue,
                            buffer,
                            size,
                            unresolved: false,
                            absLeftPoint: null,
                            absRightPoint: null,
                        };

                        subscriber.next(partItem);
                    },
                );

                subscriber.complete();

                resolve(chartViewer);
            });
        };

        const requestClosestPoints = (
            requestBody: TRequestClosestPointsProps,
        ): Observable<TPartClosestPoints> => {
            const chart = charts.find((chart) => chart.id === requestBody.seriesId)!;
            const color = getPackedRGBA(chart?.color, chart?.opacity);
            const width = chart?.width ?? 1;

            return new Observable<TPartClosestPoints>((subscriber) => {
                const [left, right] = generateClosestPoints(requestBody, serverTimeIncrementMs);

                subscriber.next({
                    absLeftPoint: isNil(left)
                        ? null
                        : createPartAbsPoint(
                              left.ts as TPointAbsTime,
                              left.value as TPointAbsValue,
                              color,
                              width,
                          ),
                    absRightPoint: isNil(right)
                        ? null
                        : createPartAbsPoint(
                              right.ts as TPointAbsTime,
                              right.value as TPointAbsValue,
                              color,
                              width,
                          ),
                });
                subscriber.complete();
            });
        };

        const chartViewer = new TimeseriesCharter(
            {
                maxPartSize: 4096,
                maxChartsCount: 64,
                maxChartPartsCount: 64,
                requestedPixelsCount: 4096,

                charts,

                serverTimeIncrement,
                somesecondsToMillisecondsRatio: somesecondsToMilliseconds(
                    1 as Someseconds,
                ) as number,
                millisecondsToSomesecondsRatio: millisecondsToSomeseconds(1 as Milliseconds),

                enableClosestPoints: true,

                screenWidth: container.clientWidth,
                screenHeight: container.clientHeight,
            },
            {
                requestPartsItems,
                requestClosestPoints,
            },
        );

        container.appendChild(chartViewer.getView());

        chartViewer.setWorldWidth(milliseconds2nanoseconds(hourInMilliseconds as Milliseconds));

        chartViewer.focusTo(millisecondsToSomeseconds(viewportTimeStart));
        // chartViewer.setDebugState(true);
    });
}

function generatePoints(
    requestBody: TRequestPartsProps,
    serverTimeIncrement: Milliseconds,
    size: number,
): TPointsSet[] {
    return (
        getDataGenerator(requestBody.seriesId).generatePoints(
            requestBody,
            serverTimeIncrement,
            size,
        ) ?? [null, null]
    );
}

function generateClosestPoints(
    requestBody: TRequestClosestPointsProps,
    serverTimeIncrement: Milliseconds,
): [TClosestPoint, TClosestPoint] {
    return (
        getDataGenerator(requestBody.seriesId).generateClosestPoints(
            requestBody,
            serverTimeIncrement,
        ) ?? [null, null]
    );
}

const getPackedRGBA = memoizee(hexToPackedRGBA, { primitive: true, length: 2, max: 100 });
