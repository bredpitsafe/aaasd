import { isEmpty, isNumber } from 'lodash-es';

import type { TSandbox } from './getSandbox';
import { getSandbox } from './getSandbox';

export type TSingleValueSandbox = TSandbox<
    {
        value: number;
    },
    number
>;

export function getNumberConversionSandbox(functionBody?: string): undefined | TSingleValueSandbox {
    return isEmpty(functionBody)
        ? undefined
        : getSandbox(prepareFunctionBody(functionBody!), 'return NaN;', validator);
}

export function validateNumberConversionFnBody(functionBody: string): boolean {
    return getNumberConversionSandbox(functionBody) !== undefined;
}

function prepareFunctionBody(body: string): string {
    return body.includes('return') ? body : `return ${body}`;
}

function validator(sandbox: TSingleValueSandbox): boolean {
    return isNumber(sandbox({ value: 0 })) && isNumber(sandbox({ value: NaN }));
}
