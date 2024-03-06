import { isNil } from 'lodash-es';
import { MonoTypeOperatorFunction, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
    createHandleError,
    createHandleFail,
    fromErrorToInfo,
    fromFailToInfo,
    TInfo,
} from '../observability';
import { logger } from '../Tracing';
import { isUnsyncedValueDescriptor, isValueDescriptor } from '../ValueDescriptor/utils';
import { tapError } from './tap';

export function logError<T>(
    callback: (info: TInfo) => void = logger.error,
    map: typeof fromErrorToInfo = fromErrorToInfo,
): MonoTypeOperatorFunction<T> {
    const handle = createHandleError(callback, map);
    return tapError(handle);
}

export function logFail<T>(
    callback: (info: TInfo) => void = logger.error,
    map: typeof fromFailToInfo = fromFailToInfo,
): MonoTypeOperatorFunction<T> {
    const handle = createHandleFail(callback, map);

    return tap<T>((value) => {
        if (isValueDescriptor(value) && isUnsyncedValueDescriptor(value) && !isNil(value.fail)) {
            handle(value.fail);
        }
    });
}

export function logErrorAndFail<T>(
    callback: (info: TInfo) => void = logger.error,
    mapError: typeof fromErrorToInfo = fromErrorToInfo,
    mapNotify: typeof fromFailToInfo = fromFailToInfo,
): MonoTypeOperatorFunction<T> {
    return pipe(logError(callback, mapError), logFail(callback, mapNotify));
}
