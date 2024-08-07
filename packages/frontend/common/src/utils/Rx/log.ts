import { tapError } from '@common/rx';
import type { MonoTypeOperatorFunction } from 'rxjs';
import { pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

import type { TInfo } from '../observability';
import {
    createHandleError,
    createHandleFail,
    fromErrorToInfo,
    fromFailToInfo,
} from '../observability';
import { logger } from '../Tracing';
import { isFailValueDescriptor, isValueDescriptor } from '../ValueDescriptor/utils';

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
        if (isValueDescriptor(value) && isFailValueDescriptor(value)) {
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
