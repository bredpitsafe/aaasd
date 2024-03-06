import { isEmpty } from 'lodash-es';

import {
    stylerUtils,
    TPointStyle,
    TPointStylerArgs,
    TPointStylerUtils,
} from '../../actors/ChartsDataProvider/actions/defs';
import { getNowNanoseconds } from '../time';
import { getSandbox, TSandbox } from './getSandbox';

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
