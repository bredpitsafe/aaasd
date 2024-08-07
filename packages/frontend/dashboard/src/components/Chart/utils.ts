import type { Milliseconds, Someseconds } from '@common/types';
import {
    microseconds2nanoseconds,
    milliseconds2nanoseconds,
    milliseconds2seconds,
    nanoseconds2microseconds,
    nanoseconds2milliseconds,
    seconds2milliseconds,
} from '@common/utils';
import JSON5 from 'json5';

import type { TChartPanelChartProps } from '../../types/panel';
import { EServerTimeUnit } from '../../types/panel';
import { getPanelLabel } from '../../utils/panels';

export type TSomeseconds2Milliseconds = (v: Someseconds) => Milliseconds;
export type TMilliseconds2Someseconds = (v: Milliseconds) => Someseconds;
export function getFirstSecondsToSecondSeconds(unit: EServerTimeUnit): {
    somesecondsToMilliseconds: TSomeseconds2Milliseconds;
    millisecondsToSomeseconds: TMilliseconds2Someseconds;
} {
    switch (unit) {
        case EServerTimeUnit.microsecond:
            return {
                somesecondsToMilliseconds:
                    nanoseconds2microseconds as unknown as TSomeseconds2Milliseconds,
                millisecondsToSomeseconds:
                    microseconds2nanoseconds as unknown as TMilliseconds2Someseconds,
            };
        case EServerTimeUnit.millisecond:
            return {
                millisecondsToSomeseconds: ((v) => v as unknown) as TMilliseconds2Someseconds,
                somesecondsToMilliseconds: ((v) => v as unknown) as TSomeseconds2Milliseconds,
            };
        case EServerTimeUnit.second:
            return {
                somesecondsToMilliseconds:
                    seconds2milliseconds as unknown as TSomeseconds2Milliseconds,
                millisecondsToSomeseconds:
                    milliseconds2seconds as unknown as TMilliseconds2Someseconds,
            };
        case EServerTimeUnit.nanosecond:
        default:
            return {
                somesecondsToMilliseconds:
                    nanoseconds2milliseconds as unknown as TSomeseconds2Milliseconds,
                millisecondsToSomeseconds:
                    milliseconds2nanoseconds as unknown as TMilliseconds2Someseconds,
            };
    }
}

export function prepareSnapshotToExport(json: object, charts: TChartPanelChartProps[]): string {
    return charts.reduce(
        (json, chart, i) =>
            json
                .replaceAll(chart.query, 'Query_' + (i + 1))
                .replaceAll(getPanelLabel(chart), 'Label_' + (i + 1)),
        JSON5.stringify(json),
    );
}
