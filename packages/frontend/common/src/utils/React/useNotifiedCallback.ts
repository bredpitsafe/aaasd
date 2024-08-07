import type { DependencyList } from 'react';
import { useCallback } from 'react';

import { useModule } from '../../di/react';
import { SafeModuleNotifications } from '../../modules/notifications/module';
import { createHandleError } from '../observability';
import { loggerReact } from '../Tracing/Children/React';

export function useNotifiedCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: DependencyList,
): T {
    const notify = useModule(SafeModuleNotifications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(
        ((...args) => {
            try {
                return callback(...args);
            } catch (err) {
                if (err instanceof Error) {
                    createHandleError(notify.error)(err);
                    createHandleError(loggerReact.error)(err);
                } else {
                    throw err;
                }
            }
        }) as T,
        deps,
    );
}
