import { isArray, isObject } from 'lodash-es';

export type TInstrumentFromErrors = {
    account?: string;
    exchange?: string;
    name?: string;
};

export function isInstrumentErrors(
    maybeErrors: unknown,
): maybeErrors is Array<TInstrumentFromErrors> {
    if (isArray(maybeErrors) && maybeErrors.every(isObject)) return true;

    return false;
}
