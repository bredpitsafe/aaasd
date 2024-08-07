import type { Milliseconds } from '@common/types';
import { milliseconds2iso, minuteInMilliseconds } from '@common/utils';

import type { TIndicator } from '../../modules/actions/indicators/defs';
import { convertIndicatorByScheme } from './converters';
import type { TConverterValue, TScheme } from './defs';

describe('Scheme config calculation tests', () => {
    const getServerTime = () => Date.UTC(2022, 0, 1, 10) as Milliseconds;
    const updateTimeWithTimeout = milliseconds2iso(Date.UTC(2022, 0, 1, 9, 58, 30) as Milliseconds);
    const updateTimeNoTimeout = milliseconds2iso(Date.UTC(2022, 0, 1, 9, 59, 30) as Milliseconds);

    const cases: [
        TIndicator['value'] | undefined,
        TIndicator['updateTime'] | undefined,
        Omit<TScheme, 'name'>,
        TConverterValue | undefined,
    ][] = [
        [
            null,
            null,
            {
                config: [{ value: 5, text: 'Text1' }, { text: 'Text2' }],
            },
            { text: 'Text2' },
        ],
        [
            null,
            null,
            {
                config: [
                    { value: null, text: 'Text1' },
                    { value: 5, text: 'Text2' },
                    { text: 'Text3' },
                ],
            },
            { text: 'Text1' },
        ],
        [
            null,
            null,
            {
                config: [
                    { left: 5, text: 'Text1' },
                    { value: 23, text: 'Text2' },
                    { value: 5, text: 'Text3' },
                    { tooltip: 'Error', text: 'Text4' },
                ],
            },
            { tooltip: 'Error', text: 'Text4' },
        ],
        [
            5,
            null,
            {
                config: [
                    { left: 5, text: 'Text1' },
                    { value: null, text: 'Text2' },
                    { value: 5, text: 'Text3' },
                    { text: 'Text4' },
                ],
            },
            { text: 'Text1' },
        ],
        [
            6,
            null,
            {
                config: [
                    { left: 5, right: 5.5, text: 'Text1' },
                    { left: 4, right: 8, text: 'Text2' },
                    { value: 5, text: 'Text3' },
                    { text: 'Text4' },
                ],
            },
            { text: 'Text2' },
        ],
        [
            6,
            null,
            {
                config: [
                    { left: 5, right: 5.5, text: 'Text1' },
                    { value: 6, text: 'Text2' },
                    { value: 5, text: 'Text3' },
                    { text: 'Text4' },
                ],
            },
            { text: 'Text2' },
        ],
        [
            6,
            null,
            {
                config: [
                    { left: 5, right: 5.5, text: 'Text1' },
                    { value: 8, text: 'Text2' },
                    { right: 10, text: 'Text3' },
                    { text: 'Text4' },
                ],
            },
            { text: 'Text3' },
        ],
        [
            6,
            null,
            {
                config: [
                    { left: 5, right: 5.5, text: 'Text1' },
                    { value: 8, text: 'Text2' },
                    { right: 3, text: 'Text3' },
                    {
                        style: {
                            backgroundColor: 'yellow',
                            borderRadius: '4px',
                        },
                        tooltip: 'Error',
                    },
                ],
            },
            {
                style: { backgroundColor: 'yellow', borderRadius: '4px' },
                tooltip: 'Error',
            },
        ],
        [
            88,
            null,
            {
                config: [
                    { left: 5, right: 5.5, text: 'Text1' },
                    { value: 8, text: 'Text2' },
                    { right: 3, text: 'Text3' },
                ],
            },
            undefined,
        ],
        [
            88,
            null,
            {
                config: [
                    { text: 'Text1' },
                    { value: 8, text: 'Text2' },
                    { right: 3, text: 'Text3' },
                ],
            },
            { text: 'Text1' },
        ],
        [
            undefined,
            null,
            {
                config: [{ value: 5, text: 'Text1' }, { text: 'Text2' }],
            },
            { text: 'Text2' },
        ],
        [
            undefined,
            null,
            {
                config: [
                    { value: null, text: 'Text1' },
                    { value: 5, text: 'Text2' },
                    { text: 'Text3' },
                ],
            },
            { text: 'Text3' },
        ],
        [
            undefined,
            null,
            {
                config: [
                    { left: 5, text: 'Text1' },
                    { value: 23, text: 'Text2' },
                    { value: 5, text: 'Text3' },
                ],
            },
            undefined,
        ],
        [
            5,
            updateTimeWithTimeout,
            {
                timeout: minuteInMilliseconds,
                timeoutStyle: {
                    border: '1px solid red',
                },
                config: [
                    { left: 5, text: 'Text1' },
                    { value: 23, text: 'Text2' },
                    { value: 5, text: 'Text3' },
                ],
            },
            { style: { border: '1px solid red' } },
        ],
        [
            5,
            updateTimeNoTimeout,
            {
                timeout: minuteInMilliseconds,
                timeoutStyle: {
                    border: '1px solid red',
                },
                config: [{ left: 5, text: 'Text1' }],
            },
            { text: 'Text1' },
        ],
    ];

    test.each(cases)('Test case - %# with value %s', (value, time, scheme, expected) => {
        expect(convertIndicatorByScheme(value, time, getServerTime(), scheme)).toEqual(expected);
    });
});
