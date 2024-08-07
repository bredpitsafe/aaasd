import type { Milliseconds } from '@common/types';
import { NanoDate } from '@common/utils';

import { timeTicks } from './timeTicks';

describe('timeTicks', () => {
    function iso2ms(isoDate: string) {
        return (new NanoDate(isoDate).microsecondsOf() / 1e3) as Milliseconds;
    }

    test.each([
        {
            start: iso2ms('2024-01-16T14:48:05.378Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-16T14:48:05.400Z'),
                iso2ms('2024-01-16T14:48:05.450Z'),
                iso2ms('2024-01-16T14:48:05.500Z'),
                iso2ms('2024-01-16T14:48:05.550Z'),
                iso2ms('2024-01-16T14:48:05.600Z'),
                iso2ms('2024-01-16T14:48:05.650Z'),
                iso2ms('2024-01-16T14:48:05.700Z'),
                iso2ms('2024-01-16T14:48:05.750Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.768Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-16T14:48:05.768Z'),
                iso2ms('2024-01-16T14:48:05.769Z'),
                iso2ms('2024-01-16T14:48:05.770Z'),
                iso2ms('2024-01-16T14:48:05.771Z'),
                iso2ms('2024-01-16T14:48:05.772Z'),
                iso2ms('2024-01-16T14:48:05.773Z'),
                iso2ms('2024-01-16T14:48:05.774Z'),
                iso2ms('2024-01-16T14:48:05.775Z'),
                iso2ms('2024-01-16T14:48:05.776Z'),
                iso2ms('2024-01-16T14:48:05.777Z'),
                iso2ms('2024-01-16T14:48:05.778Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.777Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-16T14:48:05.777Z'),
                iso2ms('2024-01-16T14:48:05.777100Z'),
                iso2ms('2024-01-16T14:48:05.777200Z'),
                iso2ms('2024-01-16T14:48:05.777300Z'),
                iso2ms('2024-01-16T14:48:05.777400Z'),
                iso2ms('2024-01-16T14:48:05.777500Z'),
                iso2ms('2024-01-16T14:48:05.777600Z'),
                iso2ms('2024-01-16T14:48:05.777700Z'),
                iso2ms('2024-01-16T14:48:05.777800Z'),
                iso2ms('2024-01-16T14:48:05.777900Z'),
                iso2ms('2024-01-16T14:48:05.778Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.778100Z'),
            end: iso2ms('2024-01-16T14:48:05.778900Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-16T14:48:05.778Z'),
                iso2ms('2024-01-16T14:48:05.778100Z'),
                iso2ms('2024-01-16T14:48:05.778200Z'),
                iso2ms('2024-01-16T14:48:05.778300Z'),
                iso2ms('2024-01-16T14:48:05.778400Z'),
                iso2ms('2024-01-16T14:48:05.778500Z'),
                iso2ms('2024-01-16T14:48:05.778600Z'),
                iso2ms('2024-01-16T14:48:05.778700Z'),
                iso2ms('2024-01-16T14:48:05.778800Z'),
                iso2ms('2024-01-16T14:48:05.778900Z'),
                iso2ms('2024-01-16T14:48:05.779Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.778Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 10,
            expected: [iso2ms('2024-01-16T14:48:05.778Z')],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.378Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 3,
            expected: [
                iso2ms('2024-01-16T14:48:05.400Z'),
                iso2ms('2024-01-16T14:48:05.500Z'),
                iso2ms('2024-01-16T14:48:05.600Z'),
                iso2ms('2024-01-16T14:48:05.700Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.768Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 3,
            expected: [iso2ms('2024-01-16T14:48:05.770Z'), iso2ms('2024-01-16T14:48:05.775Z')],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.777Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 3,
            expected: [
                iso2ms('2024-01-16T14:48:05.777Z'),
                iso2ms('2024-01-16T14:48:05.777500Z'),
                iso2ms('2024-01-16T14:48:05.778Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.778100Z'),
            end: iso2ms('2024-01-16T14:48:05.778900Z'),
            count: 3,
            expected: [
                iso2ms('2024-01-16T14:48:05.778Z'),
                iso2ms('2024-01-16T14:48:05.778500Z'),
                iso2ms('2024-01-16T14:48:05.779Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.778Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 3,
            expected: [iso2ms('2024-01-16T14:48:05.778Z')],
        },
        {
            start: iso2ms('2024-01-16T14:48:05.778Z'),
            end: iso2ms('2024-01-16T14:48:05.878Z'),
            count: 0,
            expected: [],
        },
    ])(`Less then second $start ... ($count items) ... $end`, ({ start, end, count, expected }) => {
        expect(timeTicks(start, end, count)).toEqual(expected);
    });

    test.each([
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-16T14:47:30.000Z'),
                iso2ms('2024-01-16T14:47:35.000Z'),
                iso2ms('2024-01-16T14:47:40.000Z'),
                iso2ms('2024-01-16T14:47:45.000Z'),
                iso2ms('2024-01-16T14:47:50.000Z'),
                iso2ms('2024-01-16T14:47:55.000Z'),
                iso2ms('2024-01-16T14:48:00.000Z'),
                iso2ms('2024-01-16T14:48:05.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 3,
            expected: [
                iso2ms('2024-01-16T14:47:30.000Z'),
                iso2ms('2024-01-16T14:47:45.000Z'),
                iso2ms('2024-01-16T14:48:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-16T14:48:05.778Z'),
            count: 0,
            expected: [],
        },
    ])(`Less then minute $start ... ($count items) ... $end`, ({ start, end, count, expected }) => {
        expect(timeTicks(start, end, count)).toEqual(expected);
    });

    test.each([
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-16T15:17:25.378Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-16T14:50:00.000Z'),
                iso2ms('2024-01-16T14:55:00.000Z'),
                iso2ms('2024-01-16T15:00:00.000Z'),
                iso2ms('2024-01-16T15:05:00.000Z'),
                iso2ms('2024-01-16T15:10:00.000Z'),
                iso2ms('2024-01-16T15:15:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-16T15:17:25.378Z'),
            count: 3,
            expected: [
                iso2ms('2024-01-16T14:50:00.000Z'),
                iso2ms('2024-01-16T15:00:00.000Z'),
                iso2ms('2024-01-16T15:10:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-16T15:17:25.378Z'),
            count: 0,
            expected: [],
        },
    ])(`Less then hour $start ... ($count items) ... $end`, ({ start, end, count, expected }) => {
        expect(timeTicks(start, end, count)).toEqual(expected);
    });

    test.each([
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-17T02:47:25.378Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-16T15:00:00.000Z'),
                iso2ms('2024-01-16T16:00:00.000Z'),
                iso2ms('2024-01-16T17:00:00.000Z'),
                iso2ms('2024-01-16T18:00:00.000Z'),
                iso2ms('2024-01-16T19:00:00.000Z'),
                iso2ms('2024-01-16T20:00:00.000Z'),
                iso2ms('2024-01-16T21:00:00.000Z'),
                iso2ms('2024-01-16T22:00:00.000Z'),
                iso2ms('2024-01-16T23:00:00.000Z'),
                iso2ms('2024-01-17T00:00:00.000Z'),
                iso2ms('2024-01-17T01:00:00.000Z'),
                iso2ms('2024-01-17T02:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-17T02:47:25.378Z'),
            count: 3,
            expected: [
                iso2ms('2024-01-16T16:00:00.000Z'),
                iso2ms('2024-01-16T20:00:00.000Z'),
                iso2ms('2024-01-17T00:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-17T02:47:25.378Z'),
            count: 0,
            expected: [],
        },
    ])(`Less then day $start ... ($count items) ... $end`, ({ start, end, count, expected }) => {
        expect(timeTicks(start, end, count)).toEqual(expected);
    });

    test.each([
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-20T02:47:25.378Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-16T16:00:00.000Z'),
                iso2ms('2024-01-17T00:00:00.000Z'),
                iso2ms('2024-01-17T08:00:00.000Z'),
                iso2ms('2024-01-17T16:00:00.000Z'),
                iso2ms('2024-01-18T00:00:00.000Z'),
                iso2ms('2024-01-18T08:00:00.000Z'),
                iso2ms('2024-01-18T16:00:00.000Z'),
                iso2ms('2024-01-19T00:00:00.000Z'),
                iso2ms('2024-01-19T08:00:00.000Z'),
                iso2ms('2024-01-19T16:00:00.000Z'),
                iso2ms('2024-01-20T00:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-20T02:47:25.378Z'),
            count: 3,
            expected: [
                iso2ms('2024-01-17T00:00:00.000Z'),
                iso2ms('2024-01-18T00:00:00.000Z'),
                iso2ms('2024-01-19T00:00:00.000Z'),
                iso2ms('2024-01-20T00:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-01-20T02:47:25.378Z'),
            count: 0,
            expected: [],
        },
    ])(`Less then week $start ... ($count items) ... $end`, ({ start, end, count, expected }) => {
        expect(timeTicks(start, end, count)).toEqual(expected);
    });

    test.each([
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-02-03T02:47:25.378Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-17T00:00:00.000Z'),
                iso2ms('2024-01-18T00:00:00.000Z'),
                iso2ms('2024-01-19T00:00:00.000Z'),
                iso2ms('2024-01-20T00:00:00.000Z'),
                iso2ms('2024-01-21T00:00:00.000Z'),
                iso2ms('2024-01-22T00:00:00.000Z'),
                iso2ms('2024-01-23T00:00:00.000Z'),
                iso2ms('2024-01-24T00:00:00.000Z'),
                iso2ms('2024-01-25T00:00:00.000Z'),
                iso2ms('2024-01-26T00:00:00.000Z'),
                iso2ms('2024-01-27T00:00:00.000Z'),
                iso2ms('2024-01-28T00:00:00.000Z'),
                iso2ms('2024-01-29T00:00:00.000Z'),
                iso2ms('2024-01-30T00:00:00.000Z'),
                iso2ms('2024-01-31T00:00:00.000Z'),
                iso2ms('2024-02-01T00:00:00.000Z'),
                iso2ms('2024-02-02T00:00:00.000Z'),
                iso2ms('2024-02-03T00:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-02-03T02:47:25.378Z'),
            count: 3,
            expected: [
                iso2ms('2024-01-18T00:00:00.000Z'),
                iso2ms('2024-01-23T00:00:00.000Z'),
                iso2ms('2024-01-28T00:00:00.000Z'),
                iso2ms('2024-02-02T00:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-02-03T02:47:25.378Z'),
            count: 0,
            expected: [],
        },
    ])(`Less then month $start ... ($count items) ... $end`, ({ start, end, count, expected }) => {
        expect(timeTicks(start, end, count)).toEqual(expected);
    });

    test.each([
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-06-25T14:47:25.378Z'),
            count: 10,
            expected: [
                iso2ms('2024-01-18T00:00:00.000Z'),
                iso2ms('2024-02-01T00:00:00.000Z'),
                iso2ms('2024-02-15T00:00:00.000Z'),
                iso2ms('2024-02-29T00:00:00.000Z'),
                iso2ms('2024-03-14T00:00:00.000Z'),
                iso2ms('2024-03-28T00:00:00.000Z'),
                iso2ms('2024-04-11T00:00:00.000Z'),
                iso2ms('2024-04-25T00:00:00.000Z'),
                iso2ms('2024-05-09T00:00:00.000Z'),
                iso2ms('2024-05-23T00:00:00.000Z'),
                iso2ms('2024-06-06T00:00:00.000Z'),
                iso2ms('2024-06-20T00:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-06-25T14:47:25.378Z'),
            count: 3,
            expected: [
                iso2ms('2024-01-25T00:00:00.000Z'),
                iso2ms('2024-03-14T00:00:00.000Z'),
                iso2ms('2024-05-02T00:00:00.000Z'),
                iso2ms('2024-06-20T00:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2024-02-03T02:47:25.378Z'),
            count: 0,
            expected: [],
        },
    ])(`Less then year $start ... ($count items) ... $end`, ({ start, end, count, expected }) => {
        expect(timeTicks(start, end, count)).toEqual(expected);
    });

    test.each([
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2031-01-14T14:47:25.378Z'),
            count: 10,
            expected: [
                iso2ms('2024-07-04T00:00:00.000Z'),
                iso2ms('2025-03-13T00:00:00.000Z'),
                iso2ms('2025-11-20T00:00:00.000Z'),
                iso2ms('2026-07-30T00:00:00.000Z'),
                iso2ms('2027-04-08T00:00:00.000Z'),
                iso2ms('2027-12-16T00:00:00.000Z'),
                iso2ms('2028-08-24T00:00:00.000Z'),
                iso2ms('2029-05-03T00:00:00.000Z'),
                iso2ms('2030-01-10T00:00:00.000Z'),
                iso2ms('2030-09-19T00:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2031-01-14T14:47:25.378Z'),
            count: 3,
            expected: [
                iso2ms('2025-08-28T00:00:00.000Z'),
                iso2ms('2027-12-23T00:00:00.000Z'),
                iso2ms('2030-04-18T00:00:00.000Z'),
            ],
        },
        {
            start: iso2ms('2024-01-16T14:47:25.378Z'),
            end: iso2ms('2031-01-14T14:47:25.378Z'),
            count: 0,
            expected: [],
        },
    ])(
        `Less then 10 years $start ... ($count items) ... $end`,
        ({ start, end, count, expected }) => {
            expect(timeTicks(start, end, count)).toEqual(expected);
        },
    );
});
