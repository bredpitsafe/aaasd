import { isNil } from 'lodash-es';
import { MonoTypeOperatorFunction, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ModuleFactory, TContextRef } from '../../di';
import { SafeModuleNotifications } from '../../modules/notifications/module';
import {
    createHandleError,
    createHandleFail,
    fromErrorToInfo,
    fromFailToInfo,
} from '../observability';
import { isUnsyncedValueDescriptor, isValueDescriptor } from '../ValueDescriptor/utils';
import { tapError } from './tap';

export const ModuleNotifyError = ModuleFactory((ctx: TContextRef) => {
    const notify = SafeModuleNotifications(ctx);

    return function notifyError<T>(
        map: typeof fromErrorToInfo = fromErrorToInfo,
    ): MonoTypeOperatorFunction<T> {
        const handle = createHandleError(notify.error, map);
        return tapError(handle);
    };
});

export const ModuleNotifyFail = ModuleFactory((ctx: TContextRef) => {
    const notify = SafeModuleNotifications(ctx);

    return function notifyFail<T>(
        map: typeof fromFailToInfo = fromFailToInfo,
    ): MonoTypeOperatorFunction<T> {
        const handle = createHandleFail(notify.error, map);
        return tap<T>((value) => {
            if (
                isValueDescriptor(value) &&
                isUnsyncedValueDescriptor(value) &&
                !isNil(value.fail)
            ) {
                handle(value.fail);
            }
        });
    };
});

export const ModuleNotifyErrorAndFail = ModuleFactory((ctx: TContextRef) => {
    const notifyError = ModuleNotifyError(ctx);
    const notifyFail = ModuleNotifyFail(ctx);

    return function notifyErrorAndFail<T>(
        mapError: typeof fromErrorToInfo = fromErrorToInfo,
        mapNotify: typeof fromFailToInfo = fromFailToInfo,
    ): MonoTypeOperatorFunction<T> {
        return pipe(notifyError(mapError), notifyFail(mapNotify));
    };
});
