import { Observable, ObservableInput, ObservedValueOf, OperatorFunction, Subscription } from 'rxjs';
import { innerFrom } from 'rxjs/internal/observable/innerFrom';
import { OperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import { arrRemove } from 'rxjs/internal/util/arrRemove';
import { operate } from 'rxjs/internal/util/lift';

enum EDynamicMapType {
    Merge = 'merge',
    Switch = 'switch',
    Concat = 'concat',
    Exhaust = 'exhaust',
}

export type TDynamicMapResult<
    O extends ObservableInput<any>,
    T extends EDynamicMapType = EDynamicMapType,
> = {
    type: T;
    observable: O;
};
export type TMergeMapResult<O extends ObservableInput<any>> = TDynamicMapResult<
    O,
    EDynamicMapType.Merge
>;
export type TSwitchMapResult<O extends ObservableInput<any>> = TDynamicMapResult<
    O,
    EDynamicMapType.Switch
>;

export function toMerge<O extends Observable<any>>(observable: O): TMergeMapResult<O> {
    return { type: EDynamicMapType.Merge, observable };
}
export function toSwitch<O extends Observable<any>>(observable: O): TSwitchMapResult<O> {
    return { type: EDynamicMapType.Switch, observable };
}
export function dynamicMap<T, R, O extends ObservableInput<any>>(
    project: (value: T, index: number) => TDynamicMapResult<O>,
): OperatorFunction<T, ObservedValueOf<O> | R> {
    return operate((source, subscriber) => {
        const mergedSubscriptions: Array<Subscription> = [];
        let switchSubscription: null | Subscription = null;
        let isCompletedSource = false;
        let index = 0;

        const tryComplete = () => {
            if (
                isCompletedSource &&
                switchSubscription === null &&
                mergedSubscriptions.length === 0
            ) {
                subscriber.complete();
            }
        };
        const completeSwitchSubscription = () => {
            switchSubscription?.unsubscribe();
            switchSubscription = null;
            tryComplete();
        };
        const completeMergedSubscription = (subscription: null | Subscription) => {
            arrRemove(mergedSubscriptions, subscription);
            tryComplete();
        };

        source.subscribe(
            new OperatorSubscriber(
                subscriber,
                (value) => {
                    const outerIndex = index++;
                    const { type, observable } = project(value, outerIndex);

                    if (type === 'merge') {
                        const sub = innerFrom(observable).subscribe({
                            next: (v) => subscriber.next(v),
                            error: (err) => subscriber.error(err),
                        });

                        if (sub.closed) {
                            tryComplete();
                        } else {
                            mergedSubscriptions.push(sub);
                            sub.add(() => completeMergedSubscription(sub));
                        }
                    } else if (type === 'switch') {
                        while (mergedSubscriptions.length > 0) {
                            mergedSubscriptions[mergedSubscriptions.length - 1]?.unsubscribe();
                        }
                        switchSubscription?.unsubscribe();

                        const sub = innerFrom(observable).subscribe({
                            next: (v) => subscriber.next(v),
                            error: (err) => subscriber.error(err),
                        });

                        if (sub.closed) {
                            tryComplete();
                        } else {
                            switchSubscription = sub;
                            sub.add(() => completeSwitchSubscription());
                        }
                    } else {
                        throw new Error(`Not implemented type: ${type}`);
                    }
                },
                () => {
                    isCompletedSource = true;
                    tryComplete();
                },
            ),
        );
    });
}
