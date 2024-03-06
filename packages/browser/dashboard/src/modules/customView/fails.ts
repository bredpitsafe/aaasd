import { FailFactory, TFail } from '@frontend/common/src/types/Fail';

const CustomViewFail = FailFactory('custom-view');

export function createCustomViewEmptyFail(): TFail<'[custom-view]: Empty'> {
    return CustomViewFail('Empty');
}

export function createCustomViewParseError(
    message: string,
): TFail<'[custom-view]: Parse Error', string> {
    return CustomViewFail('Parse Error', message);
}
