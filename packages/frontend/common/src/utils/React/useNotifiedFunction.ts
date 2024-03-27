import { useModule } from '../../di/react';
import { SafeModuleNotifications } from '../../modules/notifications/module';
import { assertNever } from '../assert.ts';
import { createHandleError } from '../observability';
import { loggerReact } from '../Tracing/Children/React';
import { useFunction } from './useFunction.ts';

export function useNotifiedFunction<T extends (...args: any[]) => any>(
    handler: T,
): (...args: Parameters<T>) => ReturnType<T> {
    const notify = useModule(SafeModuleNotifications);

    return useFunction((...args: Parameters<T>): ReturnType<T> => {
        try {
            return handler(...args);
        } catch (err) {
            if (err instanceof Error) {
                createHandleError(notify.error)(err);
                createHandleError(loggerReact.error)(err);
            } else {
                throw err;
            }
        }

        assertNever();
    });
}
