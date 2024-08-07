import type { Nanoseconds } from '@common/types';
import { getNowNanoseconds } from '@common/utils';
import { isString, isUndefined } from 'lodash-es';

import type { TSandbox } from './getSandbox';
import { getSandbox } from './getSandbox';

export type TPointFormatterArgs = {
    time: Nanoseconds;
    value: number;
    discriminant: string;
    nestedValues: object;
};

export type TPointFormatterSandbox = TSandbox<
    {
        tooltip: {
            message: string;
        };
        data: TPointFormatterArgs;
    },
    string
>;

export function getPointFormatterSandbox(
    functionBody?: string,
): undefined | TPointFormatterSandbox {
    if (isUndefined(functionBody)) return undefined;

    return getSandbox(functionBody, '', validator) as TPointFormatterSandbox;
}

export function validatePointFormatterFnBody(functionBody: string): boolean {
    return getPointFormatterSandbox(functionBody) !== undefined;
}

const TEST_TOOLTIP = {
    message: '',
};

const TEST_ARGS = {
    tooltip: TEST_TOOLTIP,
    data: {
        discriminant: 'test',
        nestedValues: { a: 1 },
        time: getNowNanoseconds(),
        value: Math.random(),
    },
};

function validator(sandbox: TPointFormatterSandbox): boolean {
    sandbox(TEST_ARGS);
    return isString(TEST_TOOLTIP.message);
}
