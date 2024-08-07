import type { MonoTypeOperatorFunction } from 'rxjs';
import { OperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import type { ThrottleConfig } from 'rxjs/internal/operators/throttle';
import { operate } from 'rxjs/internal/util/lift';

import { frameTasks } from '../TasksScheduler/frameTasks';

const defaultThrottleConfig: ThrottleConfig = {
    leading: true,
    trailing: false,
};

export function throttleFrame<T>(
    frames: number,
    config = defaultThrottleConfig,
): MonoTypeOperatorFunction<T> {
    return operate((source, subscriber) => {
        let hasValue = false;
        let sendValue: T | null = null;
        let throttled: VoidFunction | null = null;
        let isComplete = false;
        const send = () => {
            if (hasValue) {
                subscriber.next(sendValue as T);

                hasValue = false;
                sendValue = null;
            } else {
                throttled?.();
                throttled = null;
                isComplete && subscriber.complete();
            }
        };

        source.subscribe(
            new OperatorSubscriber<T>(
                subscriber,
                (value) => {
                    hasValue = true;
                    sendValue = value;

                    if (throttled === null) {
                        config.leading && send();
                        throttled = frameTasks.addInterval(send, frames);
                    }
                },
                () => {
                    isComplete = true;

                    if (!(config.trailing && hasValue && throttled !== null)) {
                        sendValue = null;
                        subscriber.complete();
                    }
                },
            ),
        );
    });
}
