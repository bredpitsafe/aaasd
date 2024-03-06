// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useModule } from '../../di/react';
import { SafeModuleNotifications } from '../../modules/notifications/module';
import { createHandleError } from '../observability';
import { loggerReact } from '../Tracing/Children/React';

export function useNotifiedFunction<T extends (...args: any[]) => any>(handler: T): T {
    const notify = useModule(SafeModuleNotifications);

    // @ts-ignore
    return useFunction((...args) => {
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
    });
}
