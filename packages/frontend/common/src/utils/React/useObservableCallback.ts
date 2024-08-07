import { finalizeWithLastValue } from '@common/rx';
import { isString, isUndefined, noop } from 'lodash-es';
import type { DependencyList } from 'react';
import { useCallback, useState } from 'react';
import type { Observable } from 'rxjs';
import { identity, lastValueFrom } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { ModuleMessages } from '../../modules/messages';
import type { GrpcError } from '../../types/GrpcError';
import { convertErrToGrpcError } from '../../types/GrpcError';
import type { fromErrorToInfo, fromFailToInfo } from '../observability';
import { logErrorAndFail } from '../Rx/log';
import { ModuleNotifyErrorAndFail } from '../Rx/ModuleNotify';
import { loggerReact } from '../Tracing/Children/React';
import type {
    ExtractSyncedValueDescriptorPayload,
    TValueDescriptor2,
} from '../ValueDescriptor/types';
import { isSyncedValueDescriptor, isValueDescriptor } from '../ValueDescriptor/utils';

export function useObservableCallback<
    T extends (...args: any[]) => Observable<any>,
    S = ReturnType<T> extends Observable<infer U> ? U : never,
    R = S extends TValueDescriptor2<any> ? ExtractSyncedValueDescriptorPayload<S> : S,
>(
    callback: T,
    deps: DependencyList,
): [(...args: Parameters<T>) => Promise<R>, null | S, GrpcError | null, boolean] {
    const [state, setState] = useState<null | S>(null);
    const [error, setError] = useState<null | GrpcError>(null);
    const [isPending, pending] = useState<boolean>(false);
    const call = useCallback(
        async (...args: Parameters<T>): Promise<R> => {
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
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps,
    );

    return [call, state, error, isPending] as const;
}

export function useNotifiedObservableCallback<
    T extends (...args: any[]) => Observable<any>,
    S = ReturnType<T> extends Observable<infer U> ? U : never,
    R = S extends TValueDescriptor2<any> ? ExtractSyncedValueDescriptorPayload<S> : S,
>(
    callback: T,
    deps: DependencyList,
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
): [(...args: Parameters<T>) => Promise<R>, null | S, GrpcError | null, boolean] {
    const messages = useModule(ModuleMessages);
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    return useObservableCallback<T, S, R>(
        ((...args: Parameters<T>) => {
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
        }) as T,
        deps,
    );
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
