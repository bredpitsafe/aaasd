import type { Observable, Subject, Subscription } from 'rxjs';

export interface IObserver<T, E> {
    next: (value: T) => void;
    error: (err: E) => void;
    complete: () => void;
}

export interface IObservable<T, E> extends Observable<T> {
    subscribe(next: (value: T) => void): Subscription;
    subscribe(observer?: Partial<IObserver<T, E>>): Subscription;
}

export interface ISubject<T, E> extends Subject<T> {
    error(err: E): void;
    subscribe(next: (value: T) => void): Subscription;
    subscribe(observer?: Partial<IObserver<T, E>>): Subscription;
}
