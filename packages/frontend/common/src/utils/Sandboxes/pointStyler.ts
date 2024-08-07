import type { Nanoseconds } from '@common/types';
import { getNowNanoseconds, nanoseconds2milliseconds } from '@common/utils';
import dayjs from 'dayjs';
import { clamp, isEmpty } from 'lodash-es';

import type { TSandbox } from './getSandbox';
import { getSandbox } from './getSandbox';

export type TPointStyle = {
    width: number;
    color: number;
    opacity: number;
};

export type TPointStylerArgs = {
    time: Nanoseconds;
    value: number;
};

export type TPointStylerUtils = typeof stylerUtils;

export type TPointStylerSandbox = TSandbox<
    {
        style: TPointStyle;
        data: TPointStylerArgs;
        utils: TPointStylerUtils;
    },
    void
>;

export function getPointStylerSandbox(functionBody?: string): undefined | TPointStylerSandbox {
    if (isEmpty(functionBody)) return undefined;

    return getSandbox(functionBody!, '', validator) as TPointStylerSandbox;
}

export function validatePointStylerFnBody(functionBody: string): boolean {
    return getPointStylerSandbox(functionBody) !== undefined;
}

const TEST_STYLE = {
    width: 1,
    color: 0x000000,
    opacity: 1,
};

const TEST_DATA = {
    time: getNowNanoseconds(),
    value: Math.random(),
};

function validator(sandbox: TPointStylerSandbox): boolean {
    sandbox({ style: TEST_STYLE, data: TEST_DATA, utils: stylerUtils });

    return isFinite(TEST_STYLE.width) && isFinite(TEST_STYLE.color) && isFinite(TEST_STYLE.opacity);
}

export const stylerUtils = {
    getYear: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).year(),
    getMonth: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).month(),
    getDate: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).date(),
    getDay: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).day(),
    getHour: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).hour(),
    getMinute: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).minute(),
    getSecond: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).second(),
    getMillisecond: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).millisecond(),
    clamp,
    isNaN: Number.isNaN,
};
