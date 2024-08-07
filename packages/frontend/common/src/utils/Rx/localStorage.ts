import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { concat, of } from 'rxjs';
import { operate } from 'rxjs/internal/util/lift';
import { tap } from 'rxjs/operators';

export function saveToLocalStorage<T>(
    key: string,
    map: (v: T) => string = JSON.stringify,
): MonoTypeOperatorFunction<T> {
    return tap((value: T) => {
        localStorage.setItem(key, map(value));
    });
}

export function startFromLocalStorage<T, R = T | null>(
    key: string,
    map: (v: null | string) => R = (v) => (v ? JSON.parse(v) : null),
): MonoTypeOperatorFunction<R> {
    const value = map(localStorage.getItem(key));

    return operate((source, subscriber) => {
        concat(of(value), source).subscribe(subscriber);
    });
}

export function fromLocalStorage<T, R = T | null>(
    key: string,
    map: (v: null | string) => R = (v) => (v ? JSON.parse(v) : null),
): Observable<R> {
    return of(map(localStorage.getItem(key)));
}
