import { faker } from '@faker-js/faker';
import type {
    TimeseriesServiceServer,
    TTimeseriesEntityCandle,
    TTimeseriesEntityPoint,
    TTimeseriesEntityValue,
} from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1';

import { EActorName } from '../../def/actor.ts';
import { wrapUnaryCall } from '../../utils/wrapUnaryCall.ts';
import { wrapWritableStream } from '../../utils/wrapWritableStream.ts';

export { TimeseriesServiceService } from '@grpc-schemas/trading_data_provider-api-sdk/index.services.trading_data_provider.v1';

export const timeseriesService: TimeseriesServiceServer = {
    subscribeToTimeseriesLog: (stream) => {
        const call = wrapWritableStream(
            EActorName.TimeseriesService,
            timeseriesService.subscribeToTimeseries.name,
            stream,
        );

        call.write({
            response: {
                type: 'subscribed',
                subscribed: {
                    deduplicationToken: faker.string.alphanumeric(10),
                    platformTime: faker.date.recent().toISOString(),
                },
            },
        });

        const query =
            call.request.filters?.query ??
            `${faker.finance.currencyCode()}-${faker.finance.currencyCode()}`;

        const recent = faker.date.recent();
        const future = new Date(recent);
        future.setUTCHours(future.getUTCHours() + 1);

        call.write({
            response: {
                type: 'updated',
                updated: {
                    timeseries: {
                        discriminantDict: [],
                        entities: [
                            {
                                name: query,
                                kind: 'TIMESERIES_KIND_FLOAT',
                                values: createEntityValues(
                                    recent,
                                    future,
                                    faker.number.int({ min: 1, max: 100 }),
                                ),
                            },
                        ],
                    },
                },
            },
        });
    },
    fetchTimeseriesLog: (call, cb) => {
        const callback = wrapUnaryCall(
            EActorName.TimeseriesService,
            timeseriesService.fetchTimeseriesLog.name,
            call,
            cb,
        );

        const query =
            call.request.filters?.query ??
            `${faker.finance.currencyCode()}-${faker.finance.currencyCode()}`;

        const recent = faker.date.recent();
        const past = new Date(recent);
        past.setUTCHours(past.getUTCHours() - 10);

        callback(null, {
            timeseries: {
                discriminantDict: [],
                entities: [
                    {
                        name: query,
                        kind: 'TIMESERIES_KIND_FLOAT',
                        values: createEntityValues(
                            past,
                            recent,
                            faker.number.int({ min: 200, max: 10_000 }),
                        ),
                    },
                ],
            },
        });
    },
    fetchTaggedTimeseriesDataLog: (call, cb) => {
        const callback = wrapUnaryCall(
            EActorName.TimeseriesService,
            timeseriesService.fetchTimeseriesLog.name,
            call,
            cb,
        );

        callback(null, { entities: [] });
    },
};

function createEntityValues(
    startDate: Date,
    endDate: Date,
    count: number,
): TTimeseriesEntityValue[] {
    const dates = faker.date.betweens({ from: startDate, to: endDate, count });

    return new Array(count).fill(0).map((_, index) => createEntityValue(dates[index]));
}

function createEntityValue(timestamp: Date): TTimeseriesEntityValue {
    return {
        timestamp: timestamp.toISOString(),
        value: faker.helpers.arrayElement([createEntityPointValue, createEntityCandleValue])(),
    };
}

function createEntityPointValue(): {
    type: 'point';
    point: TTimeseriesEntityPoint;
} {
    return {
        type: 'point',
        point: createSinglePoint(),
    };
}

function createEntityCandleValue(): {
    type: 'candle';
    candle: TTimeseriesEntityCandle;
} {
    const min = faker.number.float({ min: -10000, max: 10000 });
    const max = min + Math.abs(faker.number.float({ min: -10000, max: 10000 }));

    return {
        type: 'candle',
        candle: {
            min: createSinglePoint(min),
            max: createSinglePoint(max),
            open: createSinglePoint(faker.number.float({ min, max })),
            close: createSinglePoint(faker.number.float({ min, max })),
        },
    };
}

function createSinglePoint(base?: number): TTimeseriesEntityPoint {
    return {
        value: base ?? faker.number.float({ min: -10000, max: 10000 }),
    };
}
