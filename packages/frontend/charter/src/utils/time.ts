import type { Milliseconds, Seconds, Someseconds } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { seconds2milliseconds } from '@common/utils';
import { trimRight } from '@frontend/common/src/utils/trim';
import dayjs from 'dayjs';
import memoize from 'memoizee';

import { millisecondsToSomeseconds } from '../Charter/methods';
import type { IContext } from '../types';

type TOptions = {
    somesecondUnitOrder: number;
    visibleSecondFractionOrder: number;

    year?: boolean;
    month?: boolean;
    day?: boolean;
    hour?: boolean;
    minutes?: boolean;

    seconds?: boolean;
    secondsFraction?: boolean;
};

const regexpMidnight = /\s00:00:00$/;
const isMidnight = (date: string) => regexpMidnight.test(date);
const replaceMidnight = (date: string) => date.replace(regexpMidnight, '');

const regexpHour = /(\d\d:\d\d):00$/;
const isHour = (date: string) => regexpHour.test(date);
const replaceHour = (date: string) => date.replace(regexpHour, '$1');

const regexpMidnightFull = /\s00:00(:00)?(.0+)?$/;
const regexpDate = /\d\d\d\d-\d\d-\d\d\s?/;
const removeDateOrTime = (date: string) =>
    regexpMidnightFull.test(date)
        ? date.replace(regexpMidnightFull, '')
        : date.replace(regexpDate, '');

const EMPTY_HUMAN_UNIX_TIME_GROUP: { fromTo: string[]; points: string[] } = {
    fromTo: [],
    points: [],
};

export function humanUnixTimeGroup(
    values: [Seconds, Someseconds][],
    options: TOptions,
): { fromTo: string[]; points: string[] } {
    if (values.length === 0) return EMPTY_HUMAN_UNIX_TIME_GROUP;

    const humanUnixTimeOptions = { ...options, secondsFraction: false };
    let dates = values.map((value) => humanUnixTime(value, humanUnixTimeOptions));

    const usefulSecondsFraction = values[values.length - 1][0] - values[0][0] < values.length - 1;

    if (options.secondsFraction && usefulSecondsFraction) {
        const minVisibleSecondFractionOrder = getStandardSecondOrder(
            10 **
                values
                    .map(([, v]) => trimRight(String(v), '0').length)
                    .reduce((max, v) => Math.max(max, v), 0),
        );

        dates = dates.map((date, i) =>
            withSecondFraction(
                date,
                humanSecondFraction(
                    values[i][1],
                    options.somesecondUnitOrder,
                    Math.min(options.visibleSecondFractionOrder, minVisibleSecondFractionOrder),
                ),
            ),
        );
    } else {
        if (dates.every(isMidnight)) {
            dates = dates.map(replaceMidnight);
        }

        if (dates.every(isHour)) {
            dates = dates.map(replaceHour);
        }
    }

    const less10Min = values[values.length - 1][0] - values[0][0] < 10 * 60;
    const from = dates[0];
    const to = dates[dates.length - 1];
    const fromDate = from.match(regexpDate)?.[0];
    const toDate = to.match(regexpDate)?.[0];
    const sameDate = fromDate !== undefined && fromDate === toDate;

    return {
        fromTo: [fromDate ?? '', toDate ?? ''],
        points: sameDate || less10Min ? dates.map(removeDateOrTime) : dates,
    };
}

const getMajorDate = memoize(
    (time) => dayjs(seconds2milliseconds(time)).utc().format(EDateTimeFormats.DateTime),
    { max: 1000, primitive: true },
);

export function humanUnixTime(value: [Seconds, Someseconds], options: TOptions): string {
    const major = getMajorDate(value[0]);
    const minor = options.secondsFraction
        ? humanSecondFraction(
              value[1],
              options.somesecondUnitOrder,
              options.visibleSecondFractionOrder,
          )
        : '';

    return withSecondFraction(major, minor);
}

function withSecondFraction(str: string, secondFraction: string | number | ''): string {
    return secondFraction === '' ? str : `${str}.${secondFraction}`;
}

function humanSecondFraction(
    value: Someseconds,
    somesecondUnitOrder: number,
    visibleSecondFractionOrder: number,
): string {
    const valueStr = String(value)
        .padStart(somesecondUnitOrder, '0')
        .substr(0, visibleSecondFractionOrder);
    const trimmed = trimRight(valueStr, '0');

    return trimmed.padEnd(visibleSecondFractionOrder, '0');
}

function getStandardSecondOrder(size: number): number {
    const sizeStr = String(size);
    const sizeOrder = sizeStr.length - 1;
    let standardOrder = 3;

    while (sizeOrder > standardOrder) standardOrder += 3;

    return standardOrder;
}

export function getHumanUnixTimeOptions(ctx: IContext): TOptions {
    const second = millisecondsToSomeseconds(ctx.state, 1_000 as Milliseconds);

    return {
        somesecondUnitOrder: String(second).length - 1,
        visibleSecondFractionOrder: getStandardSecondOrder(
            10 ** Math.floor(Math.log(second * ctx.viewport!.scale.x) / Math.LN10),
        ),
        secondsFraction: 10 / ctx.viewport!.scale.x < second,
    };
}
