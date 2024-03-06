import type { TNotificationProps } from '@frontend/common/src/modules/notifications/def';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import type { MonoTypeOperatorFunction } from 'rxjs';

// Temporary solution until repacking value descriptor actor => ui will be solved
export function tapRuntimeError<T>(
    errorNotification: (props: TNotificationProps) => void,
): MonoTypeOperatorFunction<T> {
    return tapError((error) => {
        errorNotification({
            message: 'Unknown runtime error',
            description: error.message,
        });
    });
}
