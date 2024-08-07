import type { Observable } from 'rxjs';
import { asapScheduler, BehaviorSubject, observeOn } from 'rxjs';

export type ObservableBox<T = unknown> = {
    obs: Observable<T>;
    get: () => T;
    set: (v: T | ((v: T) => T)) => void;
    destroy: VoidFunction;
};

export function createObservableBox<T>(initialValue: T): ObservableBox<T> {
    const subject = new BehaviorSubject<T>(initialValue);
    const set = (v: ((previousValue: T) => T) | T) => {
        return typeof v === 'function' ? nextSubject(subject, v as (v: T) => T) : subject.next(v);
    };

    return {
        // use asapScheduler for escape recursion
        obs: subject.pipe(observeOn(asapScheduler)),
        get: () => subject.getValue(),
        set,
        destroy: () => subject.complete(),
    };
}

export type ComputedBox<T = unknown> = {
    obs: Observable<T>;
    get: () => T;
    destroy: VoidFunction;
};

export function createComputedBox<T>(obs: Observable<T>, seed: T): ComputedBox<T> {
    const s = new BehaviorSubject<T>(seed);

    obs.subscribe({
        next: (v: T) => s.next(v),
        complete: () => s.complete(),
    });

    return {
        // use asapScheduler for escape recursion
        obs: s.pipe(observeOn(asapScheduler)),
        get: () => s.getValue(),
        destroy: () => s.complete(),
    };
}

export function nextSubject<T>(subject: BehaviorSubject<T>, get: (v: T) => T): T {
    const newData = get(subject.getValue());
    subject.next(newData);
    return newData;
}
