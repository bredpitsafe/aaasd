import { isString, isUndefined, noop } from 'lodash-es';
import { useState } from 'react';
import { identity, lastValueFrom, Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { ModuleMessages } from '../../modules/messages';
import { convertErrToGrpcError, GrpcError } from '../../types/GrpcError';
import type { fromErrorToInfo, fromFailToInfo } from '../observability';
import { finalizeWithLastValue } from '../Rx/finalize';
import { logErrorAndFail } from '../Rx/log';
import { ModuleNotifyErrorAndFail } from '../Rx/ModuleNotify';
import { loggerReact } from '../Tracing/Children/React';
import type {
    ExtractSyncedValueDescriptorPayload,
    TValueDescriptor2,
} from '../ValueDescriptor/types';
import { isSyncedValueDescriptor, isValueDescriptor } from '../ValueDescriptor/utils';
import { useFunction } from './useFunction';

export function useObservableFunction<
    T extends (...args: any[]) => Observable<any>,
    R = ReturnType<T> extends Observable<infer U>
        ? U extends TValueDescriptor2<any>
            ? ExtractSyncedValueDescriptorPayload<U>
            : U
        : never,
>(callback: T): [(...args: Parameters<T>) => Promise<R>, R | null, GrpcError | null, boolean] {
    const [state, setState] = useState<null | R>(null);
    const [error, setError] = useState<null | GrpcError>(null);
    const [isPending, pending] = useState<boolean>(false);
    const call = useFunction(async (...args): Promise<R> => {
        pending(true);
        return lastValueFrom(
            callback(...args).pipe(
                logErrorAndFail(loggerReact.error),
                tap({
                    next: (value) => {
                        setError(null);
                        setState(value);
                    },
                    error: (err) => {
                        setState(null);
                        setError(convertErrToGrpcError(err));
                    },
                }),
                map((value) => (isValueDescriptor(value) ? value.value : value)),
                finalize(() => pending(false)),
            ),
        );
    });

    return [call, state, error, isPending] as const;
}

export function useNotifiedObservableFunction<
    T extends (...args: any[]) => Observable<any>,
    R = ReturnType<T> extends Observable<infer U>
        ? U extends TValueDescriptor2<any>
            ? ExtractSyncedValueDescriptorPayload<U>
            : U
        : never,
>(
    callback: T,
    options?: Partial<{
        getNotifyTitle: (...args: Parameters<T>) =>
            | string
            | {
                  loading: string;
                  success: string;
              };
        mapError: typeof fromErrorToInfo;
        mapFail: typeof fromFailToInfo;
    }>,
): [(...args: Parameters<T>) => Promise<R>, R | null, GrpcError | null, boolean] {
    const messages = useModule(ModuleMessages);
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    return useObservableFunction<T, R>(((...args: Parameters<T>) => {
        const titles = getTitles(options?.getNotifyTitle?.(...args));
        const close = isString(titles?.loading) ? messages.loading(titles.loading, 5) : noop;

        return callback(...args).pipe(
            notifyErrorAndFail(options?.mapError, options?.mapFail),
            finalize(close),
            isString(titles?.success)
                ? finalizeWithLastValue((vd, error) => {
                      const shouldShow =
                          isUndefined(error) &&
                          (isValueDescriptor(vd) ? isSyncedValueDescriptor(vd) : true);
                      shouldShow && messages.success(titles.success, 1);
                  })
                : identity,
        );
    }) as T);
}

function getTitles(
    messages:
        | undefined
        | string
        | {
              loading: string;
              success: string;
          },
) {
    return messages === undefined
        ? undefined
        : {
              loading: isString(messages) ? `${messages}` : messages.loading,
              success: isString(messages) ? `${messages} completed` : messages.success,
          };
}
