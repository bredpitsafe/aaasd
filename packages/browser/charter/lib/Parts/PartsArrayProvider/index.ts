import type { Someseconds } from '@frontend/common/src/types/time';
import { findLeftClosestIndex } from '@frontend/common/src/utils/findClosest';
import { plus } from '@frontend/common/src/utils/math';
import { TPackedRGBA } from '@frontend/common/src/utils/packRGBA';
import { Observable, of } from 'rxjs';

import { TRequestClosestPoints, TRequestPartsItems } from '../../../src/services/PartsLoader';
import { POINT_ITEM_SIZE, TPartItemsData, TPartPointBuffer, TSeriesId } from '../def';

export function createPartsArrayProvider(
    getPoints: (id: TSeriesId) => number[],
    getColor: (id: TSeriesId) => TPackedRGBA,
    getWidth: (id: TSeriesId) => number,
) {
    const requestChunk: TRequestPartsItems = (requestBody) => {
        const points = getPoints(requestBody.seriesId);
        const color = getColor(requestBody.seriesId);
        const width = getWidth(requestBody.seriesId);

        const startIndex = findLeftClosestIndex(requestBody.startTime, points, 2) * 2;
        const finishIndex =
            (findLeftClosestIndex(requestBody.startTime + requestBody.maxInterval, points, 2) - 1) *
            2;
        const maxBatchLength = requestBody.maxBatchSize * 2;
        const length = finishIndex - startIndex;

        return new Observable<TPartItemsData>((subscriber) => {
            if (startIndex < 0 || finishIndex <= 0) {
                return subscriber.complete();
            }

            let baseTime = requestBody.startTime;
            let baseValue = points[startIndex + 1];
            let buffer = [] as unknown as TPartPointBuffer;
            let index = 0;

            while (index < length) {
                buffer.push(
                    points[startIndex + index] - baseTime,
                    points[startIndex + index + 1] - baseValue,
                    color,
                    width,
                );

                if (buffer.length === maxBatchLength * 2) {
                    subscriber.next({
                        size: requestBody.maxBatchSize,
                        baseValue,
                        buffer: buffer,
                        interval: [baseTime, points[startIndex + index] as Someseconds],
                        unresolved: false,
                    });

                    buffer = [] as unknown as TPartPointBuffer;
                    baseTime = points[startIndex + index] as Someseconds;
                    baseValue = points[startIndex + index + 1];
                }

                index += 2;
            }

            subscriber.next({
                size: buffer.length / POINT_ITEM_SIZE,
                baseValue,
                buffer: buffer,
                interval: [baseTime, plus(requestBody.startTime, requestBody.maxInterval)],
                unresolved: false,
            });

            subscriber.complete();
        });
    };

    const requestPoints: TRequestClosestPoints = (/*requestBody: TRequestPointsBody*/) => {
        return of({
            absLeftPoint: null,
            absRightPoint: null,
        });
    };

    return { requestChunk, requestPoints };
}
